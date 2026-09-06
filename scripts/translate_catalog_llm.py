import os
import sys
import json
import time
import urllib.request
import urllib.error
import psycopg2
import psycopg2.extras
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

API_URL = os.environ.get("LLM_API_URL", "http://localhost:20128/v1/chat/completions")
API_KEY = os.environ.get("LLM_API_KEY", "sk-16b3bc62a0e33b1e-2uaigg-52fb4bdd")
MODEL_NAME = os.environ.get("LLM_MODEL", "ag/gemini-3.8-flash")
TGT_DB = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("TARGET_DB_URL", "postgresql://postgres:postgres@localhost:5432/novacanvas_db")

CACHE_FILE = os.path.join(os.path.dirname(__file__), "title_translations_cache.json")
BATCH_SIZE = 25
MAX_WORKERS = 4

lock = threading.Lock()

def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_cache(cache):
    with lock:
        try:
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(cache, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Warning saving cache: {e}")

def call_llm_batch(batch_dict, retries=3):
    prompt = (
        "You are an expert luxury wall art and home decor copywriter for Etsy and Wayfair US.\n"
        "Translate each Turkish product title into an authentic, high-converting American English product title.\n"
        "Rules:\n"
        "1. Write clear, elegant, high-converting titles optimized for US buyers and Google/Etsy search.\n"
        "2. Include primary subject, artistic style, and medium format (e.g. Canvas Wall Art, Tempered Glass Art, Decorative Wall Mirror).\n"
        "3. Keep titles concise (7-14 words), avoiding fluff words.\n"
        "4. Return ONLY a valid JSON object mapping each ID string to its translated title string. Do not wrap in markdown or backticks.\n"
        "Example output: {\"101\": \"Abstract Gold Foil Tree Canvas Wall Art, Modern Metallic Nature Print\"}"
    )
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Translate these titles:\n{json.dumps(batch_dict, ensure_ascii=False)}"}
        ],
        "temperature": 0.2,
        "stream": False
    }

    body = json.dumps(payload).encode("utf-8")

    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                API_URL,
                data=body,
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data["choices"][0]["message"]["content"].strip()
                
                # Strip markdown code blocks if present
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()

                parsed = json.loads(content)
                return parsed
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 * (attempt + 1))
            else:
                print(f"Error translating batch after {retries} attempts: {e}")
                return {}

def main():
    print("=== NOVA LUX STUDIOS — AI CATALOG TRANSLATION ENGINE ===")
    print(f"Connecting to database: {TGT_DB}")
    print(f"Using model: {MODEL_NAME} at {API_URL}")
    
    conn = psycopg2.connect(TGT_DB)
    cur = conn.cursor()

    cur.execute("""
        SELECT product_id, title_tr 
        FROM product 
        WHERE title_tr IS NOT NULL AND title_tr != '' 
        ORDER BY product_id;
    """)
    rows = cur.fetchall()
    total_products = len(rows)
    print(f"Total products to verify/translate: {total_products}")

    cache = load_cache()
    print(f"Loaded {len(cache)} existing translations from cache.")

    # Find which ones need LLM translation
    to_translate = []
    already_done = 0
    for pid, title_tr in rows:
        str_pid = str(pid)
        if str_pid in cache and cache[str_pid]:
            already_done += 1
        else:
            to_translate.append((str_pid, title_tr))

    print(f"Already cached: {already_done} | Remaining to translate: {len(to_translate)}")

    # Split to_translate into batches
    batches = []
    for i in range(0, len(to_translate), BATCH_SIZE):
        chunk = to_translate[i:i + BATCH_SIZE]
        batch_dict = {pid: t_tr for pid, t_tr in chunk}
        batches.append(batch_dict)

    print(f"Prepared {len(batches)} batches (batch size = {BATCH_SIZE}, threads = {MAX_WORKERS})")
    start_time = time.time()
    completed_count = already_done

    if batches:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_batch = {executor.submit(call_llm_batch, b): b for b in batches}
            
            batch_idx = 0
            for future in as_completed(future_to_batch):
                batch_dict = future_to_batch[future]
                batch_idx += 1
                try:
                    result = future.result()
                    if result:
                        for pid, en_title in result.items():
                            if en_title and isinstance(en_title, str):
                                cache[str(pid)] = en_title.strip()
                                completed_count += 1
                        
                        # Periodically save cache
                        if batch_idx % 5 == 0 or batch_idx == len(batches):
                            save_cache(cache)

                        elapsed = time.time() - start_time
                        rate = (completed_count - already_done) / max(elapsed, 0.1)
                        print(f"[{batch_idx}/{len(batches)}] Progress: {completed_count}/{total_products} ({rate:.1f} items/s) - Saved.")
                    else:
                        print(f"[{batch_idx}/{len(batches)}] Warning: Batch returned empty result.")
                except Exception as exc:
                    print(f"[{batch_idx}/{len(batches)}] Exception in batch: {exc}")

        save_cache(cache)

    print("\n--- Applying Translations to PostgreSQL Database ---")
    update_cur = conn.cursor()
    updated_in_db = 0
    
    update_batch = []
    for pid_str, en_title in cache.items():
        update_batch.append((en_title, int(pid_str)))
        if len(update_batch) >= 500:
            psycopg2.extras.execute_batch(
                update_cur,
                "UPDATE product SET title = %s WHERE product_id = %s;",
                update_batch
            )
            conn.commit()
            updated_in_db += len(update_batch)
            print(f"Applied {updated_in_db} / {len(cache)} titles to DB...")
            update_batch = []

    if update_batch:
        psycopg2.extras.execute_batch(
            update_cur,
            "UPDATE product SET title = %s WHERE product_id = %s;",
            update_batch
        )
        conn.commit()
        updated_in_db += len(update_batch)

    # Also update frame variation names
    print("\n--- Updating Frame Variation Names to Luxury American Standards ---")
    frame_updates = [
        (7, "Gallery Wrapped Canvas (Ready to Hang)"),
        (8, "Matte Black Floating Frame"),
        (9, "Classic White Floating Frame"),
        (10, "Brushed Gold Floating Frame"),
        (11, "Brushed Silver Floating Frame"),
        (12, "Espresso Walnut Floating Frame"),
        (13, "Natural Oak Floating Frame"),
        (223, "Natural Solid Wood Frame"),
        (224, "Crisp White LED Illumination"),
        (225, "Warm Ambient LED Illumination"),
        (226, "Golden Amber LED Illumination"),
    ]
    for opt_id, opt_name in frame_updates:
        update_cur.execute("UPDATE variation_option SET name = %s WHERE variation_option_id = %s;", (opt_name, opt_id))
    conn.commit()

    print(f"\n=======================================================")
    print(f"TRANSLATION COMPLETE!")
    print(f"Total Products Translated & Updated: {updated_in_db}")
    print(f"Frame Variations Upgraded: {len(frame_updates)}")
    print(f"Cache saved to: {CACHE_FILE}")
    print(f"Total elapsed time: {time.time() - start_time:.2f} seconds")
    print(f"=======================================================")

    update_cur.close()
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
