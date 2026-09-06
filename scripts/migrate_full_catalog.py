import os
import psycopg2
import psycopg2.extras
import re
import sys
import time

SRC_DB = os.environ.get("SOURCE_DB_URL", "postgresql://postgres:SdnZSAfjFNqdAOKxTtrKSrXJfdmENCLm@reseau.proxy.rlwy.net:47970/railway")
TGT_DB = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("TARGET_DB_URL", "postgresql://postgres:postgres@localhost:5432/novacanvas_db")

CATEGORY_MAPPING = {
    # 100: Wall Art (Duvar Sanatı)
    # 101: Modern & Abstract
    4: 101, 12: 101, 21: 101, 22: 101, 42: 101,
    # 102: Nature & Botanicals
    9: 102, 15: 102, 26: 102,
    # 103: Panoramic Collection
    27: 103,
    # 104: Architecture & Cities
    5: 104, 11: 104,
    # 105: Heritage & Classics
    1: 105, 2: 105, 3: 105, 8: 105, 10: 105, 13: 105, 19: 105, 25: 105,
    # 106: Contemporary & Pop Art
    7: 106, 14: 106, 16: 106, 17: 106, 18: 106, 20: 106, 23: 106, 24: 106, 29: 106,
    
    # 200: Glass Art (Cam Tablolar)
    # 201: Tempered Glass Wall Art
    30: 201, 40: 201, 41: 201, 43: 201, 44: 201, 45: 201, 47: 201, 48: 201, 49: 201, 50: 201, 51: 201,
    # 202: Culinary & Decorative Glass
    32: 202, 46: 202,

    # 300: Mirrors & Reflections (Aynalar)
    # 301: Architectural Wall Mirrors
    33: 301
}

# Translation helper for English titles
TR_TO_EN_REPLACEMENTS = [
    ("Kanvas Tablo", "Canvas Wall Art"),
    ("Cam Tablo", "Tempered Glass Art"),
    ("Parçalı Tablo", "Multi-Panel Canvas"),
    ("Duvar Tablosu", "Fine Wall Art"),
    ("Duvar Aynası", "Wall Mirror"),
    ("Cam Kesme Tahtası", "Tempered Glass Board"),
    ("Tablo", "Wall Art"),
    ("Kişiye Özel", "Custom Studio"),
    ("Modern Soyut", "Modern Abstract"),
    ("Soyut", "Abstract"),
    ("Doğa Manzarası", "Scenic Nature"),
    ("Manzara", "Landscape"),
    ("Şehir ve Mimari", "Urban Architecture"),
    ("Çiçekli", "Botanical Floral"),
    ("Hayvanlar Alemi", "Wildlife & Animals"),
    ("Klasik", "Heritage Classic"),
    ("Tasarım", "Designer Edition"),
    ("Panoramik", "Panoramic")
]

def translate_to_english_title(tr_title: str) -> str:
    if not tr_title:
        return "Untitled Fine Art"
    t = tr_title.strip()
    for tr_w, en_w in TR_TO_EN_REPLACEMENTS:
        t = re.sub(re.escape(tr_w), en_w, t, flags=re.IGNORECASE)
    t = re.sub(r'\s+', ' ', t).strip(' -—–')
    if "Canvas" not in t and "Art" not in t and "Mirror" not in t and "Glass" not in t:
        t += " — Fine Canvas Art"
    return t

def calculate_option_a_usd(olcu_str: str, cerceve: str) -> float:
    base = 49.0
    if olcu_str:
        m = re.search(r'(\d+)\s*(?:cm)?\s*[xX*]\s*(\d+)', olcu_str)
        if m:
            w, h = int(m.group(1)), int(m.group(2))
            area = w * h
            if area <= 1200:
                base = 49.0
            elif area <= 2000:
                base = 59.0
            elif area <= 2800:
                base = 69.0
            elif area <= 3600:
                base = 89.0
            elif area <= 5500:
                base = 119.0
            elif area <= 7200:
                base = 149.0
            elif area <= 8000:
                base = 169.0
            elif area <= 10000:
                base = 189.0
            else:
                base = 229.0
    if cerceve and any(f in cerceve.lower() for f in ['ahşap', 'çerçeve', 'led', 'gold', 'siyah', 'beyaz']):
        base += 20.0
    return round(base, 2)

def full_image_url(path: str) -> str:
    if not path:
        return ""
    if path.startswith("http://") or path.startswith("https://"):
        return path
    if not path.startswith("/"):
        path = "/" + path
    return f"https://www.canvasia.com.tr{path}"

def run_migration():
    print("=== STARTING NOVA LUX STUDIOS FULL CATALOG MIGRATION ===")
    t0 = time.time()
    
    print("Connecting to Railway source DB (READ ONLY)...")
    conn_src = psycopg2.connect(SRC_DB)
    conn_src.set_session(readonly=True)
    cur_src = conn_src.cursor(cursor_factory=psycopg2.extras.DictCursor)

    print("Connecting to target DB...")
    conn_tgt = psycopg2.connect(TGT_DB)
    conn_tgt.autocommit = False
    cur_tgt = conn_tgt.cursor()

    try:
        print("\n[0/5] Ensuring target DB schema & indexes...")
        cur_tgt.execute("""
            ALTER TABLE product ADD COLUMN IF NOT EXISTS title_tr VARCHAR(255);
            ALTER TABLE product ADD COLUMN IF NOT EXISTS description_tr TEXT;
            ALTER TABLE product_variant ADD COLUMN IF NOT EXISTS price_try NUMERIC(12, 2);
            ALTER TABLE category ADD COLUMN IF NOT EXISTS name_tr VARCHAR(255);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_product_image_unique ON product_image (product_id, image_url);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_review_prod_text ON review (product_id, md5(review_text));
        """)
        conn_tgt.commit()

        print("\n[1/5] Setting up 3-Pillar Category Architecture...")
        pillars = [
            (100, "Wall Art", "Duvar Sanatı & Kanvas", "WALL-ART", None, "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/cercevesizfon01.webp"),
            (101, "Modern & Abstract", "Modern & Soyut Sanat", "MODERN-ABSTRACT", 100, "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/gold01.webp"),
            (102, "Nature & Botanicals", "Doğa & Botanik", "NATURE-BOTANICALS", 100, "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesizfon01.webp"),
            (103, "Panoramic Editions", "Panoramik Koleksiyon", "PANORAMIC-COLLECTION", 100, "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/cercevesizfon01.webp"),
            (104, "Architecture & Cities", "Şehir & Mimari Manzaralar", "ARCHITECTURE-CITIES", 100, "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/cercevesizfon01.webp"),
            (105, "Heritage & Classics", "Klasik & Kültürel Eserler", "HERITAGE-CLASSICS", 100, "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/cercevesizfon01.webp"),
            (106, "Contemporary & Living", "Çağdaş & Özel Tasarım", "CONTEMPORARY-LIVING", 100, "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/cercevesizfon01.webp"),

            (200, "Glass Art", "Cam Tablolar & Cam Sanatı", "GLASS-ART", None, "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/gold01.webp"),
            (201, "Tempered Glass Wall Art", "Kırılmaz Temperli Cam Tablolar", "TEMPERED-GLASS-ART", 200, "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/gold01.webp"),
            (202, "Culinary & Decorative Glass", "Mutfak & Cam Kesme Tahtası", "CULINARY-GLASS", 200, "https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/gold01.webp"),

            (300, "Mirrors & Reflections", "Tasarım Duvar Aynaları", "MIRRORS", None, "https://www.canvasia.com.tr/uploads/products/kisiye-ozel-instagram-tasarimli-duvar-aynasi-isimli-ve-fotografli-ayna-ana-44aa879d.webp"),
            (301, "Architectural Wall Mirrors", "Dekoratif Duvar Aynaları", "WALL-MIRRORS", 300, "https://www.canvasia.com.tr/uploads/products/kisiye-ozel-instagram-tasarimli-duvar-aynasi-isimli-ve-fotografli-ayna-ana-44aa879d.webp"),
            (302, "Illuminated LED Mirrors", "Işıklı LED Aynalar", "LED-MIRRORS", 300, "https://www.canvasia.com.tr/uploads/products/kisiye-ozel-instagram-tasarimli-duvar-aynasi-isimli-ve-fotografli-ayna-ana-44aa879d.webp"),
        ]

        for cid, name_en, name_tr, code, pid, img in pillars:
            cur_tgt.execute("""
                INSERT INTO category (category_id, name, name_tr, code, parent_id, image_url)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (category_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    name_tr = EXCLUDED.name_tr,
                    code = EXCLUDED.code,
                    parent_id = EXCLUDED.parent_id,
                    image_url = EXCLUDED.image_url;
            """, (cid, name_en, name_tr, code, pid, img))
            for vid in [1, 2]:
                cur_tgt.execute("""
                    INSERT INTO category_variation (category_id, variation_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING;
                """, (cid, vid))

        conn_tgt.commit()
        print("Categories and variations mapped successfully.")

        print("\n[2/5] Syncing All Size and Frame Variations...")
        cur_src.execute("""
            SELECT DISTINCT "Olcu" FROM "UrunSecenekleri" WHERE "Olcu" IS NOT NULL AND "Olcu" != '';
        """)
        src_sizes = [r[0].strip() for r in cur_src.fetchall()]
        
        cur_tgt.execute("SELECT name, code, variation_option_id FROM variation_option WHERE variation_id = 1;")
        existing_sizes = cur_tgt.fetchall()
        existing_size_map = {r[0]: r[2] for r in existing_sizes}
        existing_size_code_map = {r[1]: r[2] for r in existing_sizes}
        
        for s in src_sizes:
            if s not in existing_size_map:
                code_str = "SIZE_" + re.sub(r'[^A-Za-z0-9]', '', s).upper()[:20]
                if code_str in existing_size_code_map:
                    existing_size_map[s] = existing_size_code_map[code_str]
                else:
                    cur_tgt.execute("""
                        INSERT INTO variation_option (name, code, variation_id)
                        VALUES (%s, %s, 1)
                        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
                        RETURNING variation_option_id;
                    """, (s, code_str))
                    vid = cur_tgt.fetchone()[0]
                    existing_size_map[s] = vid
                    existing_size_code_map[code_str] = vid

        cur_tgt.execute("SELECT name, code, variation_option_id FROM variation_option WHERE variation_id = 2;")
        existing_frames = cur_tgt.fetchall()
        existing_frame_map = {r[0]: r[2] for r in existing_frames}
        existing_frame_code_map = {r[1]: r[2] for r in existing_frames}

        frame_options = [
            ("Standart (Çerçevesiz)", "FRAME_NONE"),
            ("Ahşap Çerçeve", "FRAME_WOOD"),
            ("Beyaz LED", "FRAME_LED_WHITE"),
            ("Günışığı LED", "FRAME_LED_WARM"),
            ("Amber LED", "FRAME_LED_AMBER")
        ]
        for fname, fcode in frame_options:
            if fname not in existing_frame_map:
                if fcode in existing_frame_code_map:
                    existing_frame_map[fname] = existing_frame_code_map[fcode]
                else:
                    cur_tgt.execute("""
                        INSERT INTO variation_option (name, code, variation_id)
                        VALUES (%s, %s, 2)
                        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
                        RETURNING variation_option_id;
                    """, (fname, fcode))
                    vid = cur_tgt.fetchone()[0]
                    existing_frame_map[fname] = vid
                    existing_frame_code_map[fcode] = vid

        conn_tgt.commit()
        print(f"Variation options populated. Sizes: {len(existing_size_map)}, Frames: {len(existing_frame_map)}")

        print("\n[3/5] Loading image and option indices from source DB...")
        cur_src.execute("""
            SELECT "UrunId", "ResimYolu" FROM "UrunResimleri" WHERE "ResimYolu" IS NOT NULL AND "SilindiMi" = false;
        """)
        gallery_map = {}
        for uid, rpath in cur_src.fetchall():
            gallery_map.setdefault(uid, []).append(full_image_url(rpath))

        print("\n[4/5] Migrating 12,271 Products, Variants & Images...")
        cur_src.execute("""
            SELECT "Id", "Baslik", "Aciklama", "AnaGorselUrl", "KategoriId", "UrunTipi",
                   "OlusturulmaTarihi", "OneCikanMi", "AnaSayfadaGoster", "AktifMi", "SilindiMi", "SKU"
            FROM "Urunler"
            ORDER BY "Id";
        """)
        all_products = cur_src.fetchall()
        total_prods = len(all_products)

        cur_src.execute("""
            SELECT "Id", "UrunId", "Olcu", "CerceveTipi", "SatisFiyati", "StokAdedi"
            FROM "UrunSecenekleri"
            WHERE "SilindiMi" = false
            ORDER BY "UrunId", "Id";
        """)
        variant_map = {}
        for row in cur_src.fetchall():
            variant_map.setdefault(row['UrunId'], []).append(dict(row))

        batch_size = 500
        migrated_prods = 0
        migrated_variants = 0
        migrated_images = 0
        src_to_tgt_prod_id = {}

        for i in range(0, total_prods, batch_size):
            batch = all_products[i:i + batch_size]
            for p in batch:
                src_id = p['Id']
                code = f"CVS-{src_id}"
                tr_title = p['Baslik'] or f"Sanatsal Tablo #{src_id}"
                en_title = translate_to_english_title(tr_title)
                
                tr_desc = p['Aciklama'] or "Nova Lux Studios güvencesiyle 1. sınıf pamuklu kanvas ve archival pigment mürekkeplerle üretilen premium duvar tablosu."
                en_desc = "Museum-grade wall art crafted on 380gsm cotton canvas with archival pigment inks. Hand-stretched over kiln-dried pine stretcher bars for enduring elegance."

                src_cat = p['KategoriId']
                src_type = p['UrunTipi']
                
                if src_type == 'Cam Tablo' or (src_cat and src_cat in [30, 40, 41, 43, 44, 45, 47, 48, 49, 50, 51]):
                    tgt_cat = 201
                elif src_type == 'Cam Kesme Tahtası' or src_cat in [32, 46]:
                    tgt_cat = 202
                elif src_type == 'Ayna' or src_cat == 33:
                    tgt_cat = 301
                else:
                    tgt_cat = CATEGORY_MAPPING.get(src_cat, 101)

                starred = bool(p['OneCikanMi'] or p['AnaSayfadaGoster'])
                status = bool(p['AktifMi'] and not p['SilindiMi'])
                date_added = p['OlusturulmaTarihi']

                cur_tgt.execute("""
                    INSERT INTO product (code, title, title_tr, description, description_tr, category_id, shipping_method_id, starred, status, date_added)
                    VALUES (%s, %s, %s, %s, %s, %s, 1, %s, %s, %s)
                    ON CONFLICT (code) DO UPDATE SET
                        title = EXCLUDED.title,
                        title_tr = EXCLUDED.title_tr,
                        description = EXCLUDED.description,
                        description_tr = EXCLUDED.description_tr,
                        category_id = EXCLUDED.category_id,
                        starred = EXCLUDED.starred,
                        status = EXCLUDED.status
                    RETURNING product_id;
                """, (code, en_title, tr_title, en_desc, tr_desc, tgt_cat, starred, status, date_added))
                tgt_pid = cur_tgt.fetchone()[0]
                src_to_tgt_prod_id[src_id] = tgt_pid
                migrated_prods += 1

                main_img = full_image_url(p['AnaGorselUrl'])
                if main_img:
                    cur_tgt.execute("""
                        INSERT INTO product_image (product_id, image_url, is_default)
                        VALUES (%s, %s, true)
                        ON CONFLICT DO NOTHING;
                    """, (tgt_pid, main_img))
                    migrated_images += 1

                for g_img in gallery_map.get(src_id, []):
                    if g_img != main_img:
                        cur_tgt.execute("""
                            INSERT INTO product_image (product_id, image_url, is_default)
                            VALUES (%s, %s, false)
                            ON CONFLICT DO NOTHING;
                        """, (tgt_pid, g_img))
                        migrated_images += 1

                p_variants = variant_map.get(src_id, [])
                if not p_variants:
                    sku = f"{code}-DEFAULT"
                    price_usd = 49.0
                    price_try = 490.0
                    cur_tgt.execute("""
                        INSERT INTO product_variant (product_id, sku, price, price_try, quantity_in_stock, disabled)
                        VALUES (%s, %s, %s, %s, 100, false)
                        ON CONFLICT (sku) DO UPDATE SET
                            price = EXCLUDED.price,
                            price_try = EXCLUDED.price_try
                        RETURNING product_variant_id;
                    """, (tgt_pid, sku, price_usd, price_try))
                    migrated_variants += 1
                else:
                    for v in p_variants:
                        v_id = v['Id']
                        sku = f"{code}-V{v_id}"
                        olcu = (v['Olcu'] or '').strip()
                        cerceve = (v['CerceveTipi'] or '').strip()
                        price_usd = calculate_option_a_usd(olcu, cerceve)
                        price_try = float(v['SatisFiyati']) if v['SatisFiyati'] else (price_usd * 34.0)
                        qty = v['StokAdedi'] if v['StokAdedi'] is not None else 100

                        cur_tgt.execute("""
                            INSERT INTO product_variant (product_id, sku, price, price_try, quantity_in_stock, disabled)
                            VALUES (%s, %s, %s, %s, %s, false)
                            ON CONFLICT (sku) DO UPDATE SET
                                price = EXCLUDED.price,
                                price_try = EXCLUDED.price_try,
                                quantity_in_stock = EXCLUDED.quantity_in_stock
                            RETURNING product_variant_id;
                        """, (tgt_pid, sku, price_usd, price_try, qty))
                        tgt_pvid = cur_tgt.fetchone()[0]
                        migrated_variants += 1

                        if olcu in existing_size_map:
                            cur_tgt.execute("""
                                INSERT INTO product_variant_property (product_variant_id, variation_option_id)
                                VALUES (%s, %s)
                                ON CONFLICT DO NOTHING;
                            """, (tgt_pvid, existing_size_map[olcu]))
                        
                        f_opt_name = cerceve if cerceve in existing_frame_map else "Standart (Çerçevesiz)"
                        if f_opt_name in existing_frame_map:
                            cur_tgt.execute("""
                                INSERT INTO product_variant_property (product_variant_id, variation_option_id)
                                VALUES (%s, %s)
                                ON CONFLICT DO NOTHING;
                            """, (tgt_pvid, existing_frame_map[f_opt_name]))

            conn_tgt.commit()
            print(f"Processed {min(i + batch_size, total_prods)} / {total_prods} products... ({migrated_variants} variants)")

        print("\n[5/5] Migrating Approved Customer Reviews...")
        cur_tgt.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_review_prod_text ON review (product_id, md5(review_text));
        """)
        conn_tgt.commit()

        # Find a valid shop_user ID for legacy reviews attribution
        cur_tgt.execute("SELECT user_id FROM shop_user ORDER BY user_id LIMIT 1;")
        user_row = cur_tgt.fetchone()
        default_user_id = user_row[0] if user_row else 1

        cur_src.execute("""
            SELECT "Id", "UrunId", "AdSoyad", "YorumMetni", "Puan", "OlusturulmaTarihi"
            FROM "Yorumlar"
            WHERE "OnayliMi" = true AND "YorumMetni" IS NOT NULL AND "YorumMetni" != ''
            ORDER BY "Id";
        """)
        all_reviews = cur_src.fetchall()
        migrated_reviews = 0
        
        for r in all_reviews:
            src_uid = r['UrunId']
            if src_uid in src_to_tgt_prod_id:
                tgt_pid = src_to_tgt_prod_id[src_uid]
                rating = float(r['Puan']) if r['Puan'] else 5.0
                text = r['YorumMetni'].strip()
                sub_date = r['OlusturulmaTarihi']
                cur_tgt.execute("""
                    INSERT INTO review (product_id, rating, review_text, date_of_submission, user_id)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (product_id, md5(review_text)) DO NOTHING;
                """, (tgt_pid, rating, text, sub_date, default_user_id))
                migrated_reviews += 1

        conn_tgt.commit()
        print(f"Migrated {migrated_reviews} real customer reviews successfully.")

        t1 = time.time()
        print(f"\n=======================================================")
        print(f"MIGRATION COMPLETED IN {t1 - t0:.2f} SECONDS!")
        print(f"Products Migrated : {migrated_prods}")
        print(f"Variants Migrated : {migrated_variants}")
        print(f"Images Attached   : {migrated_images}")
        print(f"Reviews Migrated  : {migrated_reviews}")
        print(f"=======================================================")

    except Exception as e:
        conn_tgt.rollback()
        print(f"\nERROR during migration: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cur_src.close()
        conn_src.close()
        cur_tgt.close()
        conn_tgt.close()

if __name__ == "__main__":
    run_migration()
