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

CACHE_FILE = os.path.join(os.path.dirname(__file__), "review_translations_cache.json")
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
        "You are an expert copywriter translating customer reviews for a luxury wall art and home decor brand.\n"
        "Translate each Turkish customer review into natural, authentic American English as written by real US buyers.\n"
        "Rules:\n"
        "1. Sound natural, friendly, and authentic (like real Etsy or Wayfair verified customer reviews).\n"
        "2. Preserve the exact sentiment, enthusiasm, and emojis if present.\n"
        "3. Translate Turkish idioms naturally (e.g. 'elinize sağlık' -> 'incredible craftsmanship' or 'thank you so much').\n"
        "4. Return ONLY a valid JSON object mapping each ID string to its translated English review text. No markdown fences.\n"
        "Example: {\"1\": \"Absolutely loved it! Arrived in perfect packaging and the colors look so vibrant on our living room wall.\"}"
    )

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Translate these reviews:\n{json.dumps(batch_dict, ensure_ascii=False)}"}
        ],
        "temperature": 0.3,
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
                print(f"Error translating batch: {e}")
                return {}

def main():
    print("=== NOVA LUX STUDIOS — AI REVIEW TRANSLATION ENGINE ===")
    print(f"Connecting to database: {TGT_DB}")
    print(f"Using model: {MODEL_NAME} at {API_URL}")

    conn = psycopg2.connect(TGT_DB)
    cur = conn.cursor()

    # Step 1: Ensure review_text_tr column exists and is populated with original Turkish text
    print("\n[1/4] Ensuring database schema (review_text_tr)...")
    cur.execute("""
        ALTER TABLE review ADD COLUMN IF NOT EXISTS review_text_tr TEXT;
        UPDATE review SET review_text_tr = review_text WHERE review_text_tr IS NULL;
        DROP INDEX IF EXISTS idx_review_prod_text;
    """)
    conn.commit()

    # Step 2: Get all distinct Turkish reviews that need translation
    cur.execute("""
        SELECT DISTINCT review_text_tr 
        FROM review 
        WHERE review_text_tr IS NOT NULL AND review_text_tr != '';
    """)
    distinct_reviews = [r[0] for r in cur.fetchall()]
    print(f"[2/4] Found {len(distinct_reviews)} distinct customer review texts to translate.")

    cache = load_cache()
    print(f"Loaded {len(cache)} existing review translations from cache.")

    to_translate = []
    already_done = 0
    for idx, tr_text in enumerate(distinct_reviews):
        if tr_text in cache and cache[tr_text]:
            already_done += 1
        else:
            to_translate.append((str(idx), tr_text))

    print(f"Already cached: {already_done} | Remaining to translate: {len(to_translate)}")

    # Step 3: Run LLM translation in batches
    batches = []
    for i in range(0, len(to_translate), BATCH_SIZE):
        chunk = to_translate[i:i + BATCH_SIZE]
        batch_dict = {idx_str: text for idx_str, text in chunk}
        batches.append(batch_dict)

    print(f"[3/4] Running translation across {len(batches)} batches ({MAX_WORKERS} threads)...")
    start_time = time.time()
    completed_count = already_done

    if batches:
        idx_to_tr_text = {idx_str: text for idx_str, text in to_translate}
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_batch = {executor.submit(call_llm_batch, b): b for b in batches}

            batch_idx = 0
            for future in as_completed(future_to_batch):
                batch_idx += 1
                try:
                    result = future.result()
                    if result:
                        for idx_str, en_text in result.items():
                            if idx_str in idx_to_tr_text and en_text and isinstance(en_text, str):
                                original_tr = idx_to_tr_text[idx_str]
                                cache[original_tr] = en_text.strip()
                                completed_count += 1

                        if batch_idx % 5 == 0 or batch_idx == len(batches):
                            save_cache(cache)

                        elapsed = time.time() - start_time
                        rate = (completed_count - already_done) / max(elapsed, 0.1)
                        print(f"[{batch_idx}/{len(batches)}] Progress: {completed_count}/{len(distinct_reviews)} ({rate:.1f} reviews/s)")
                    else:
                        print(f"[{batch_idx}/{len(batches)}] Warning: Empty result from batch.")
                except Exception as exc:
                    print(f"[{batch_idx}/{len(batches)}] Exception: {exc}")

        save_cache(cache)

    # Step 4: Apply translations to PostgreSQL database
    print("\n[4/4] Updating review records in PostgreSQL database...")
    update_cur = conn.cursor()
    updated_count = 0

    update_batch = []
    for tr_text, en_text in cache.items():
        update_batch.append((en_text, tr_text))
        if len(update_batch) >= 500:
            psycopg2.extras.execute_batch(
                update_cur,
                "UPDATE review SET review_text = %s WHERE review_text_tr = %s;",
                update_batch
            )
            conn.commit()
            updated_count += len(update_batch)
            print(f"Applied {updated_count} / {len(cache)} unique translations to reviews...")
            update_batch = []

    if update_batch:
        psycopg2.extras.execute_batch(
            update_cur,
            "UPDATE review SET review_text = %s WHERE review_text_tr = %s;",
            update_batch
        )
        conn.commit()
        updated_count += len(update_batch)

    # Count how many total reviews were updated
    update_cur.execute("SELECT count(*) FROM review WHERE review_text != review_text_tr;")
    total_modified = update_cur.fetchone()[0]

    print(f"\n=======================================================")
    print(f"REVIEW TRANSLATION COMPLETE!")
    print(f"Unique Review Texts Translated : {len(cache)}")
    print(f"Total Reviews Updated in DB     : {total_modified}")
    print(f"Cache saved to                  : {CACHE_FILE}")
    print(f"Total time                      : {time.time() - start_time:.2f} seconds")
    print(f"=======================================================")

    update_cur.close()
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
