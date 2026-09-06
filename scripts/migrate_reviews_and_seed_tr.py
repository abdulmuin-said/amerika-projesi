import sys
import psycopg2

db_url = sys.argv[1] if len(sys.argv) > 1 else "postgresql://novacanvas:novacanvas_secure_pass_2025@localhost:5432/novacanvas_db"

conn = psycopg2.connect(db_url)
conn.autocommit = True
cur = conn.cursor()

print("1. Adding is_approved to review table...")
cur.execute("""
    ALTER TABLE review ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true;
""")
print("   Done.")

print("2. Updating Turkish titles and descriptions for demo products 1..15...")
seed_tr = [
    (1, "Ethereal Whispers — Soyut Panoramik Kanvas Tablo", "Huzur veren adaçayı yeşili, kum beji ve pudra tonlarında dingin soyut kompozisyon. 380 gr/m² saf pamuklu kanvas üzerine 12 renkli arşivsel pigment baskı."),
    (2, "Pastel Ufuk Uyumu — Minimalist Kanvas Tablo", "Yumuşak pastel tonların dingin ufuk çizgisiyle buluştuğu minimalist modern eser. Salon ve yatak odaları için huzurlu atmosfer."),
    (3, "Toprak & Terakota Düşü — Modern Kanvas Tablo", "Sıcak terakota ve toprak dokularının çağdaş soyut yorumu. Masif ahşap şasi üzerine el işçiliği germe."),
    (4, "Altın Tan Işıltısı — Çağdaş Kanvas Tablo", "Güneşin doğuşunu simgeleyen altın ve krem katmanlı zengin dokulu modern tablo."),
    (5, "Tropikal Hibiskus Alacakaranlığı — Botanik Kanvas Tablo", "Zengin tropikal yaprak ve çiçek formlarının alacakaranlık tonlarında sanatsal dışavurumu."),
    (6, "Turkuaz Serenat & Pudra — Akışkan Sanat Kanvas Tablo", "Turkuaz ve pudra dalgalarının sıvı hareketini tuvale taşıyan lüks modern çalışma."),
    (7, "Okyanus Sisi & Mercan Bulutu — Akrilik Kanvas Tablo", "Derin okyanus esintilerini mercan tonlarıyla birleştiren çağdaş fırça darbeleri."),
    (8, "Yaldızlı Göksel Akış — Büyük Boy Kanvas Tablo", "Gece göğünün derinliğini yaldızlı pirinç ışıltılarıyla buluşturan prestijli panoramik eser."),
    (9, "Ege Mavisi & Akışkan Pirinç — Soyut Kanvas Tablo", "Ege'nin berrak sularını akışkan pirinç tonlarıyla harmanlayan ferahlatıcı sanat parçası."),
    (10, "Mermerimsi Opal Yankısı — Çağdaş Kanvas Tablo", "Doğal mermer damarlarının opal renk yansımalarıyla birleştiği modern akışkan tasarım."),
    (11, "Kuş Uçuşu Ahenk — Geometrik Kanvas Tablo", "Modern minimalist geometrik silüetlerin kusursuz dengesi."),
    (12, "Gün Dönümü Tüneme — Retro Geometrik Kanvas Tablo", "Mid-century modern tarzda zamansız renk blokları ve formlar."),
    (13, "Kum Tepesi Yalnızlığı — Doğal Manzara Kanvas Tablo", "Çöl kumullarının sakin ve dingin dalgalarını betimleyen huzurlu manzara."),
    (14, "Sisli Dalgalı Sırtlar — İskandinav Manzara Kanvas Tablo", "Nordik dağ sırtlarının sisler arasındaki gizemli ve ferahlatıcı panoraması."),
    (15, "Altın Saat Bulvarı — Şehir Silüeti Kanvas Tablo", "Akşamüstü altın saat ışığında şehrin modern ve büyüleyici silüeti.")
]

for p_id, title_tr, desc_tr in seed_tr:
    cur.execute("""
        UPDATE product 
        SET title_tr = %s,
            description_tr = %s
        WHERE product_id = %s;
    """, (title_tr, desc_tr, p_id))

print("   Updated seed products 1..15.")

cur.execute("SELECT COUNT(*) FROM review WHERE is_approved = true;")
approved_count = cur.fetchone()[0]
print(f"3. Total approved reviews in DB: {approved_count}")

cur.close()
conn.close()
print("Migration completed successfully!")
