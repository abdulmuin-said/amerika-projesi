-- ====================================================================
-- NOVACANVAS STUDIOS — ENTERPRISE DATABASE INITIALIZATION & SEED SCRIPT
-- White-Label Fine Canvas E-Commerce Showcase (Delaware / US Domestic)
-- ====================================================================

BEGIN;


-- 1. Schema Tables (Idempotent DDL)
CREATE TABLE IF NOT EXISTS role (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS address (
    address_id SERIAL PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode INT NOT NULL,
    country VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS shop_user (
    user_id SERIAL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_no VARCHAR(50) NOT NULL,
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
    removed BOOLEAN NOT NULL DEFAULT FALSE,
    role_id INT NOT NULL REFERENCES role(role_id),
    address_id INT REFERENCES address(address_id)
);

CREATE TABLE IF NOT EXISTS shipping_method (
    shipping_method_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin_country VARCHAR(100) NOT NULL,
    origin_postal_code VARCHAR(50),
    processing_time_min INT NOT NULL,
    processing_time_max INT NOT NULL
);

CREATE TABLE IF NOT EXISTS shipping_method_option (
    id SERIAL PRIMARY KEY,
    shipping_method_id INT NOT NULL REFERENCES shipping_method(shipping_method_id) ON DELETE CASCADE,
    destination_country VARCHAR(100) NOT NULL,
    carrier VARCHAR(100),
    cost_first_item DOUBLE PRECISION NOT NULL,
    cost_additional_item DOUBLE PRECISION DEFAULT 0.0,
    estimated_delivery_min INT NOT NULL,
    estimated_delivery_max INT NOT NULL
);

CREATE TABLE IF NOT EXISTS category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(500),
    parent_id INT REFERENCES category(category_id)
);

CREATE TABLE IF NOT EXISTS variation (
    variation_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS variation_option (
    variation_option_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE,
    variation_id INT NOT NULL REFERENCES variation(variation_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS category_variation (
    category_id INT NOT NULL REFERENCES category(category_id) ON DELETE CASCADE,
    variation_id INT NOT NULL REFERENCES variation(variation_id) ON DELETE CASCADE,
    PRIMARY KEY (category_id, variation_id)
);

CREATE TABLE IF NOT EXISTS product (
    product_id SERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL REFERENCES category(category_id),
    shipping_method_id INT NOT NULL REFERENCES shipping_method(shipping_method_id),
    starred BOOLEAN NOT NULL DEFAULT FALSE,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    date_added TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_image (
    product_image_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS product_variant (
    product_variant_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    sku VARCHAR(255) NOT NULL UNIQUE,
    price DOUBLE PRECISION NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 100,
    disabled BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS product_variant_property (
    product_variant_id INT NOT NULL REFERENCES product_variant(product_variant_id) ON DELETE CASCADE,
    variation_option_id INT NOT NULL REFERENCES variation_option(variation_option_id) ON DELETE CASCADE,
    PRIMARY KEY (product_variant_id, variation_option_id)
);

CREATE TABLE IF NOT EXISTS payment_method (
    payment_method_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    card_holder_name VARCHAR(255),
    last4 VARCHAR(4),
    provider_token VARCHAR(255),
    expiry_month VARCHAR(2),
    expiry_year VARCHAR(2),
    is_default BOOLEAN DEFAULT FALSE,
    user_id INT REFERENCES shop_user(user_id)
);

CREATE TABLE IF NOT EXISTS shop_order (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES shop_user(user_id),
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    shipping_address_id INT NOT NULL REFERENCES address(address_id),
    payment_method_id INT REFERENCES payment_method(payment_method_id),
    conversation_id VARCHAR(255) UNIQUE,
    shipping_method_id INT REFERENCES shipping_method(shipping_method_id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    estimated_delivery_date DATE,
    shipping_provider VARCHAR(255) DEFAULT 'FedEx Ground',
    payment_provider VARCHAR(255) DEFAULT 'Stripe',
    carrier_name VARCHAR(255) DEFAULT 'FedEx',
    tracking_number VARCHAR(255),
    subtotal_amount DOUBLE PRECISION NOT NULL,
    shipping_amount DOUBLE PRECISION NOT NULL,
    tax_amount DOUBLE PRECISION DEFAULT 0.0,
    discount_amount DOUBLE PRECISION DEFAULT 0.0,
    total_amount DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS order_item (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES shop_order(order_id) ON DELETE CASCADE,
    product_variant_id INT NOT NULL REFERENCES product_variant(product_variant_id),
    shipping_method_id INT REFERENCES shipping_method(shipping_method_id),
    quantity INT NOT NULL DEFAULT 1,
    price DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transaction (
    payment_transaction_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL UNIQUE REFERENCES shop_order(order_id) ON DELETE CASCADE,
    conversation_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_payment_intent_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    paid_price DOUBLE PRECISION,
    currency VARCHAR(10) DEFAULT 'USD',
    installment INT DEFAULT 1,
    fraud_status INT DEFAULT 1,
    auth_code VARCHAR(255),
    card_family VARCHAR(50),
    card_association VARCHAR(50),
    card_type VARCHAR(50),
    last_four_digits VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- 2. User Roles

INSERT INTO role (role_id, name) VALUES
  (1, 'PLATFORM_ADMIN'),
  (2, 'ADMIN'),
  (3, 'CUSTOMER')
ON CONFLICT (role_id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Seed Addresses

INSERT INTO address (address_id, street, city, pincode, country) VALUES
  (1, '450 Lexington Ave, Suite 1800', 'New York', 10017, 'United States'),
  (2, '742 Evergreen Terrace', 'New York', 10001, 'United States')
ON CONFLICT (address_id) DO UPDATE SET street = EXCLUDED.street, city = EXCLUDED.city;

-- 4. System Users (Admin: admin@novacanvas.com / Admin123! | Customer: sarah.jenkins@example.com / Customer123!)

INSERT INTO shop_user (user_id, email, password, full_name, phone_no, joined_at, removed, role_id, address_id) VALUES
  (1, 'admin@novacanvas.com', '$2b$12$7JGB3j/ZTaHDHc4p6vm7veAvSZGCsBF8imBSqZdJ2DaiYJeOwqnQC', 'NovaCanvas Administrator', '+1 (555) 019-2834', '2025-01-01', FALSE, 1, 1),
  (2, 'sarah.jenkins@example.com', '$2b$12$xOQ4fnF4q59iU3MGnZ9RXOZvEaEFZvWP9IHlNJdqxKGc48vOkGrZ.', 'Sarah Jenkins', '+1 (555) 839-4021', '2025-01-15', FALSE, 3, 2)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, full_name = EXCLUDED.full_name;

-- 5. US Domestic & Express Shipping Methods

INSERT INTO shipping_method (shipping_method_id, name, origin_country, origin_postal_code, processing_time_min, processing_time_max) VALUES
  (1, 'FedEx Ground & Express Art Delivery', 'United States', '10001', 1, 2)
ON CONFLICT (shipping_method_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO shipping_method_option (id, shipping_method_id, destination_country, carrier, cost_first_item, cost_additional_item, estimated_delivery_min, estimated_delivery_max) VALUES
  (1, 1, 'United States', 'FedEx Ground', 0.00, 0.00, 3, 5),
  (2, 1, 'United States', 'FedEx 2-Day Air', 15.00, 5.00, 2, 2)
ON CONFLICT (id) DO UPDATE SET cost_first_item = EXCLUDED.cost_first_item;

-- 6. Art Catalog Categories

INSERT INTO category (category_id, name, code, image_url, parent_id) VALUES
  (1, 'Panoramic Wall Art', 'PANORAMIC-ART', 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/cercevesizfon01.webp', NULL),
  (2, 'Abstract & Fluid Art', 'ABSTRACT-FLUID', 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/cercevesizfon01.webp', NULL),
  (3, 'Landscape & Horizons', 'LANDSCAPE-HORIZONS', 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/cercevesizfon01.webp', NULL),
  (4, 'Botanical & Zen Sanctuary', 'BOTANICAL-ZEN', 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesizfon01.webp', NULL)
ON CONFLICT (category_id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 7. Product Variations (Size & Framing)

INSERT INTO variation (variation_id, name) VALUES
  (1, 'Canvas Size'),
  (2, 'Framing Style')
ON CONFLICT (variation_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO variation_option (variation_option_id, name, code, variation_id) VALUES
  (1, '24" x 8" (60x20 cm)', 'SIZE_24X8', 1),
  (2, '30" x 10" (75x25 cm)', 'SIZE_30X10', 1),
  (3, '36" x 12" (90x30 cm)', 'SIZE_36X12', 1),
  (4, '48" x 16" (120x40 cm)', 'SIZE_48X16', 1),
  (5, '60" x 20" (150x50 cm)', 'SIZE_60X20', 1),
  (6, '71" x 24" (180x60 cm)', 'SIZE_71X24', 1),
  (7, 'Gallery Wrap (Frameless)', 'FRAME_NONE', 2),
  (8, 'Matte Black Float Frame', 'FRAME_BLACK', 2),
  (9, 'Classic White Float Frame', 'FRAME_WHITE', 2),
  (10, 'Modern Brass Gold Frame', 'FRAME_GOLD', 2),
  (11, 'Brushed Silver Frame', 'FRAME_SILVER', 2),
  (12, 'Espresso Walnut Frame', 'FRAME_WALNUT', 2),
  (13, 'Natural Oak Float Frame', 'FRAME_OAK', 2)
ON CONFLICT (variation_option_id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- Link variations to all categories
INSERT INTO category_variation (category_id, variation_id) VALUES
  (1, 1), (1, 2),
  (2, 1), (2, 2),
  (3, 1), (3, 2),
  (4, 1), (4, 2)
ON CONFLICT DO NOTHING;

-- 8. Curated Fine Art Products (15 Modern American Canvas Artworks)

INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (1, 'CVS-PAN-001', 'Ethereal Whispers — Abstract Panoramic Canvas', 'A serene modern composition rendered in harmonious sage green, sand beige, and blush rose. Gentle textural gradients bring calm, grounded sophistication to living rooms, master bedrooms, and executive suites. Printed on museum-grade 380gsm poly-cotton canvas using 12-color archival pigment inks guaranteed against fading for 100+ years.', 1, 1, TRUE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (2, 'CVS-PAN-002', 'Pastel Horizon Harmony — Minimalist Wall Art', 'Sculpted with bold palette-knife textures, this piece explores warm ivory, soothing mint, and soft blush transitions across an expansive horizontal silhouette. Hand-stretched over kiln-dried North American pine stretcher bars with precision gallery corners.', 1, 1, TRUE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (3, 'CVS-PAN-003', 'Earth & Terracotta Reverie — Modern Fine Art', 'Warm terracotta, olive sage, and deep umber converge in geometric tranquility. Designed to soften architectural lines and elevate contemporary organic spaces with museum-quality color fidelity and satin protective lacquer.', 2, 1, TRUE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (4, 'CVS-PAN-004', 'Golden Aurora Nuance — Contemporary Canvas', 'Delicate champagne gold leaf accents float above subtle blush and eucalyptus hues, catching ambient gallery lighting from every viewing angle. Ideal above master beds, low-profile credenzas, and salon seating.', 2, 1, TRUE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (5, 'CVS-PAN-005', 'Tropical Hibiscus Twilight — Botanical Wall Art', 'Vibrant coral hibiscus petals pop against a dramatic midnight emerald canopy. A statement centerpiece that infuses lively warmth and lush botanical sophistication into modern dining rooms and entry corridors.', 4, 1, TRUE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (6, 'CVS-PAN-006', 'Turquoise Serenade & Blush — Fluid Motion Art', 'Dynamic wave crests of aqua turquoise and powdered rose dance alongside luminous gilded veins, capturing the mesmerizing rhythm of tidal movement. Sealed with UV-inhibiting museum clear coat.', 2, 1, FALSE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (7, 'CVS-PAN-007', 'Ocean Mist & Coral Cloud — Modern Acrylic Wash', 'Smoky ocean blue meets ethereal coral in an exquisite liquid acrylic wash, highlighted by hand-applied metallic gold leaf accents. Brings oceanic tranquility and contemporary depth to expansive walls.', 2, 1, FALSE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (8, 'CVS-PAN-008', 'Gilded Celestial Flow — Grand Statement Canvas', 'A striking horizontal flow of deep cobalt, champagne blush, and lustrous gold leaf that creates an opulent focal point above sofas and consoles. Premium cotton canvas stretched on 1.5-inch solid wood frame bars.', 2, 1, FALSE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (9, 'CVS-PAN-009', 'Aegean Azure & Liquid Brass — Fluid Art Canvas', 'Rich Mediterranean blues interwoven with crystalline gold leaf veins provide visual movement and contemplative tranquility for luxury interior styling and modern living areas.', 2, 1, FALSE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (10, 'CVS-PAN-010', 'Marbleized Opal Echo — Contemporary Fluid Art', 'Organic cellular patterns and fluid marble veining harmonize soothing pastel accents with radiant gold ribbons across a wide panoramic canvas. Arrives ready to hang with pre-installed heavy-duty D-rings.', 2, 1, FALSE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (11, 'CVS-PAN-011', 'Avian Harmony — Modern Geometric Silhouette', 'Playful avian silhouettes perched upon minimalist wire geometry, punctuated by warm saffron, terracotta, and soft sky blue color blocking. An instant conversation piece for creative studios and modern lofts.', 1, 1, FALSE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (12, 'CVS-PAN-012', 'Solstice Perch — Mid-Century Geometric Canvas', 'An uplifting celebration of morning light featuring stylized birds and a warm golden sun disc set within clean mid-century geometric forms. Printed with ultra-high resolution Giclée technology.', 1, 1, FALSE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (13, 'CVS-PAN-013', 'Dune Solitude — Earthy Horizon Landscape', 'Rolling desert dunes and atmospheric skies presented in muted sage, rust, and clay tones. A grounded, modern take on nature''s grandeur that complements Scandinavian and Japandi interior aesthetics.', 3, 1, FALSE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (14, 'CVS-PAN-014', 'Misty Rolling Ridges — Nordic Landscape Canvas', 'Soft misty hills cascading into a foggy morning horizon. Mustard, terracotta, and eucalyptus green tones bring Scandinavian calmness indoors with panoramic panoramic proportions.', 3, 1, FALSE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;


INSERT INTO product (product_id, code, title, description, category_id, shipping_method_id, starred, status, date_added)
VALUES (15, 'CVS-PAN-015', 'Golden Hour Boulevard — Urban Silhouette Art', 'Figures traversing a glowing sunset boulevard with luminous reflections and cool cobalt contrast, capturing the timeless poetry and electric heartbeat of twilight city life.', 3, 1, TRUE, TRUE, NOW())
ON CONFLICT (product_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

-- 9. Product Images (Multi-angle & Room Mockups)
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (1, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (2, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (3, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (4, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (5, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (6, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (7, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (8, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (9, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (10, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (11, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (12, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (13, 1, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-001/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (14, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (15, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (16, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (17, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (18, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (19, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (20, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (21, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (22, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (23, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (24, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (25, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (26, 2, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-002/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (27, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (28, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (29, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (30, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (31, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (32, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (33, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (34, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (35, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (36, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (37, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (38, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (39, 3, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-003/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (40, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (41, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (42, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (43, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (44, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (45, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (46, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (47, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (48, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (49, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (50, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (51, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (52, 4, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-004/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (53, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (54, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (55, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (56, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (57, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (58, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (59, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (60, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (61, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (62, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (63, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (64, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (65, 5, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-005/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (66, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (67, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (68, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (69, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (70, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (71, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (72, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (73, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (74, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (75, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (76, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (77, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (78, 6, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-006/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (79, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (80, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (81, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (82, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (83, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (84, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (85, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (86, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (87, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (88, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (89, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (90, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (91, 7, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-007/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (92, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (93, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (94, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (95, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (96, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (97, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (98, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (99, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (100, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (101, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (102, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (103, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (104, 8, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-008/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (105, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (106, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (107, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (108, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (109, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (110, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (111, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (112, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (113, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (114, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (115, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (116, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (117, 9, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-009/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (118, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (119, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (120, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (121, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (122, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (123, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (124, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (125, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (126, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (127, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (128, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (129, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (130, 10, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-010/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (131, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (132, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (133, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (134, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (135, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (136, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (137, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (138, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (139, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (140, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (141, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (142, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (143, 11, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-011/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (144, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (145, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (146, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (147, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (148, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (149, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (150, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (151, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (152, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (153, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (154, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (155, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (156, 12, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-012/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (157, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (158, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (159, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (160, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (161, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (162, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (163, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (164, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (165, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (166, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (167, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (168, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (169, 13, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-013/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (170, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (171, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (172, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (173, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (174, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (175, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (176, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (177, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (178, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (179, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (180, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (181, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (182, 14, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-014/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (183, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/beyaz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (184, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/cercevesiz01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (185, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/cercevesiz02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (186, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/cercevesiz03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (187, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/cercevesiz04.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (188, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/cercevesizfon01.webp', TRUE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (189, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/cercevesizfon02.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (190, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/cercevesizfon03.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (191, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/gold01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (192, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/gumus01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (193, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/kahve01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (194, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/naturel01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;
INSERT INTO product_image (product_image_id, product_id, image_url, is_default) VALUES (195, 15, 'https://www.canvasia.com.tr/img/products/kanvas-panoramik/cvs-pan-015/siyah01.webp', FALSE) ON CONFLICT (product_image_id) DO UPDATE SET image_url = EXCLUDED.image_url;

-- 10. Product Variants & Attributes (42 Combinations per Artwork, USD $49 to $228)
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (1, 1, 'CVS-PAN-001-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (1, 1), (1, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (2, 1, 'CVS-PAN-001-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (2, 1), (2, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (3, 1, 'CVS-PAN-001-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (3, 1), (3, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (4, 1, 'CVS-PAN-001-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (4, 1), (4, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (5, 1, 'CVS-PAN-001-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (5, 1), (5, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (6, 1, 'CVS-PAN-001-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (6, 1), (6, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (7, 1, 'CVS-PAN-001-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (7, 1), (7, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (8, 1, 'CVS-PAN-001-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (8, 2), (8, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (9, 1, 'CVS-PAN-001-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (9, 2), (9, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (10, 1, 'CVS-PAN-001-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (10, 2), (10, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (11, 1, 'CVS-PAN-001-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (11, 2), (11, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (12, 1, 'CVS-PAN-001-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (12, 2), (12, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (13, 1, 'CVS-PAN-001-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (13, 2), (13, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (14, 1, 'CVS-PAN-001-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (14, 2), (14, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (15, 1, 'CVS-PAN-001-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (15, 3), (15, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (16, 1, 'CVS-PAN-001-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (16, 3), (16, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (17, 1, 'CVS-PAN-001-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (17, 3), (17, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (18, 1, 'CVS-PAN-001-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (18, 3), (18, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (19, 1, 'CVS-PAN-001-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (19, 3), (19, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (20, 1, 'CVS-PAN-001-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (20, 3), (20, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (21, 1, 'CVS-PAN-001-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (21, 3), (21, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (22, 1, 'CVS-PAN-001-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (22, 4), (22, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (23, 1, 'CVS-PAN-001-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (23, 4), (23, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (24, 1, 'CVS-PAN-001-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (24, 4), (24, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (25, 1, 'CVS-PAN-001-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (25, 4), (25, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (26, 1, 'CVS-PAN-001-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (26, 4), (26, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (27, 1, 'CVS-PAN-001-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (27, 4), (27, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (28, 1, 'CVS-PAN-001-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (28, 4), (28, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (29, 1, 'CVS-PAN-001-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (29, 5), (29, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (30, 1, 'CVS-PAN-001-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (30, 5), (30, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (31, 1, 'CVS-PAN-001-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (31, 5), (31, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (32, 1, 'CVS-PAN-001-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (32, 5), (32, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (33, 1, 'CVS-PAN-001-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (33, 5), (33, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (34, 1, 'CVS-PAN-001-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (34, 5), (34, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (35, 1, 'CVS-PAN-001-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (35, 5), (35, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (36, 1, 'CVS-PAN-001-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (36, 6), (36, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (37, 1, 'CVS-PAN-001-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (37, 6), (37, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (38, 1, 'CVS-PAN-001-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (38, 6), (38, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (39, 1, 'CVS-PAN-001-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (39, 6), (39, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (40, 1, 'CVS-PAN-001-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (40, 6), (40, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (41, 1, 'CVS-PAN-001-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (41, 6), (41, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (42, 1, 'CVS-PAN-001-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (42, 6), (42, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (43, 2, 'CVS-PAN-002-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (43, 1), (43, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (44, 2, 'CVS-PAN-002-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (44, 1), (44, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (45, 2, 'CVS-PAN-002-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (45, 1), (45, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (46, 2, 'CVS-PAN-002-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (46, 1), (46, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (47, 2, 'CVS-PAN-002-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (47, 1), (47, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (48, 2, 'CVS-PAN-002-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (48, 1), (48, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (49, 2, 'CVS-PAN-002-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (49, 1), (49, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (50, 2, 'CVS-PAN-002-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (50, 2), (50, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (51, 2, 'CVS-PAN-002-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (51, 2), (51, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (52, 2, 'CVS-PAN-002-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (52, 2), (52, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (53, 2, 'CVS-PAN-002-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (53, 2), (53, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (54, 2, 'CVS-PAN-002-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (54, 2), (54, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (55, 2, 'CVS-PAN-002-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (55, 2), (55, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (56, 2, 'CVS-PAN-002-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (56, 2), (56, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (57, 2, 'CVS-PAN-002-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (57, 3), (57, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (58, 2, 'CVS-PAN-002-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (58, 3), (58, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (59, 2, 'CVS-PAN-002-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (59, 3), (59, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (60, 2, 'CVS-PAN-002-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (60, 3), (60, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (61, 2, 'CVS-PAN-002-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (61, 3), (61, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (62, 2, 'CVS-PAN-002-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (62, 3), (62, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (63, 2, 'CVS-PAN-002-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (63, 3), (63, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (64, 2, 'CVS-PAN-002-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (64, 4), (64, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (65, 2, 'CVS-PAN-002-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (65, 4), (65, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (66, 2, 'CVS-PAN-002-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (66, 4), (66, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (67, 2, 'CVS-PAN-002-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (67, 4), (67, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (68, 2, 'CVS-PAN-002-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (68, 4), (68, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (69, 2, 'CVS-PAN-002-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (69, 4), (69, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (70, 2, 'CVS-PAN-002-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (70, 4), (70, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (71, 2, 'CVS-PAN-002-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (71, 5), (71, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (72, 2, 'CVS-PAN-002-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (72, 5), (72, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (73, 2, 'CVS-PAN-002-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (73, 5), (73, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (74, 2, 'CVS-PAN-002-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (74, 5), (74, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (75, 2, 'CVS-PAN-002-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (75, 5), (75, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (76, 2, 'CVS-PAN-002-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (76, 5), (76, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (77, 2, 'CVS-PAN-002-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (77, 5), (77, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (78, 2, 'CVS-PAN-002-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (78, 6), (78, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (79, 2, 'CVS-PAN-002-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (79, 6), (79, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (80, 2, 'CVS-PAN-002-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (80, 6), (80, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (81, 2, 'CVS-PAN-002-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (81, 6), (81, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (82, 2, 'CVS-PAN-002-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (82, 6), (82, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (83, 2, 'CVS-PAN-002-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (83, 6), (83, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (84, 2, 'CVS-PAN-002-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (84, 6), (84, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (85, 3, 'CVS-PAN-003-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (85, 1), (85, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (86, 3, 'CVS-PAN-003-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (86, 1), (86, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (87, 3, 'CVS-PAN-003-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (87, 1), (87, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (88, 3, 'CVS-PAN-003-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (88, 1), (88, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (89, 3, 'CVS-PAN-003-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (89, 1), (89, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (90, 3, 'CVS-PAN-003-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (90, 1), (90, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (91, 3, 'CVS-PAN-003-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (91, 1), (91, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (92, 3, 'CVS-PAN-003-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (92, 2), (92, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (93, 3, 'CVS-PAN-003-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (93, 2), (93, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (94, 3, 'CVS-PAN-003-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (94, 2), (94, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (95, 3, 'CVS-PAN-003-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (95, 2), (95, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (96, 3, 'CVS-PAN-003-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (96, 2), (96, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (97, 3, 'CVS-PAN-003-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (97, 2), (97, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (98, 3, 'CVS-PAN-003-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (98, 2), (98, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (99, 3, 'CVS-PAN-003-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (99, 3), (99, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (100, 3, 'CVS-PAN-003-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (100, 3), (100, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (101, 3, 'CVS-PAN-003-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (101, 3), (101, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (102, 3, 'CVS-PAN-003-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (102, 3), (102, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (103, 3, 'CVS-PAN-003-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (103, 3), (103, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (104, 3, 'CVS-PAN-003-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (104, 3), (104, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (105, 3, 'CVS-PAN-003-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (105, 3), (105, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (106, 3, 'CVS-PAN-003-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (106, 4), (106, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (107, 3, 'CVS-PAN-003-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (107, 4), (107, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (108, 3, 'CVS-PAN-003-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (108, 4), (108, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (109, 3, 'CVS-PAN-003-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (109, 4), (109, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (110, 3, 'CVS-PAN-003-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (110, 4), (110, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (111, 3, 'CVS-PAN-003-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (111, 4), (111, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (112, 3, 'CVS-PAN-003-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (112, 4), (112, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (113, 3, 'CVS-PAN-003-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (113, 5), (113, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (114, 3, 'CVS-PAN-003-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (114, 5), (114, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (115, 3, 'CVS-PAN-003-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (115, 5), (115, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (116, 3, 'CVS-PAN-003-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (116, 5), (116, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (117, 3, 'CVS-PAN-003-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (117, 5), (117, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (118, 3, 'CVS-PAN-003-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (118, 5), (118, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (119, 3, 'CVS-PAN-003-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (119, 5), (119, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (120, 3, 'CVS-PAN-003-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (120, 6), (120, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (121, 3, 'CVS-PAN-003-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (121, 6), (121, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (122, 3, 'CVS-PAN-003-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (122, 6), (122, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (123, 3, 'CVS-PAN-003-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (123, 6), (123, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (124, 3, 'CVS-PAN-003-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (124, 6), (124, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (125, 3, 'CVS-PAN-003-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (125, 6), (125, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (126, 3, 'CVS-PAN-003-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (126, 6), (126, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (127, 4, 'CVS-PAN-004-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (127, 1), (127, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (128, 4, 'CVS-PAN-004-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (128, 1), (128, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (129, 4, 'CVS-PAN-004-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (129, 1), (129, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (130, 4, 'CVS-PAN-004-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (130, 1), (130, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (131, 4, 'CVS-PAN-004-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (131, 1), (131, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (132, 4, 'CVS-PAN-004-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (132, 1), (132, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (133, 4, 'CVS-PAN-004-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (133, 1), (133, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (134, 4, 'CVS-PAN-004-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (134, 2), (134, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (135, 4, 'CVS-PAN-004-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (135, 2), (135, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (136, 4, 'CVS-PAN-004-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (136, 2), (136, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (137, 4, 'CVS-PAN-004-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (137, 2), (137, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (138, 4, 'CVS-PAN-004-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (138, 2), (138, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (139, 4, 'CVS-PAN-004-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (139, 2), (139, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (140, 4, 'CVS-PAN-004-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (140, 2), (140, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (141, 4, 'CVS-PAN-004-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (141, 3), (141, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (142, 4, 'CVS-PAN-004-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (142, 3), (142, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (143, 4, 'CVS-PAN-004-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (143, 3), (143, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (144, 4, 'CVS-PAN-004-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (144, 3), (144, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (145, 4, 'CVS-PAN-004-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (145, 3), (145, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (146, 4, 'CVS-PAN-004-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (146, 3), (146, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (147, 4, 'CVS-PAN-004-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (147, 3), (147, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (148, 4, 'CVS-PAN-004-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (148, 4), (148, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (149, 4, 'CVS-PAN-004-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (149, 4), (149, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (150, 4, 'CVS-PAN-004-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (150, 4), (150, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (151, 4, 'CVS-PAN-004-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (151, 4), (151, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (152, 4, 'CVS-PAN-004-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (152, 4), (152, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (153, 4, 'CVS-PAN-004-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (153, 4), (153, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (154, 4, 'CVS-PAN-004-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (154, 4), (154, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (155, 4, 'CVS-PAN-004-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (155, 5), (155, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (156, 4, 'CVS-PAN-004-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (156, 5), (156, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (157, 4, 'CVS-PAN-004-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (157, 5), (157, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (158, 4, 'CVS-PAN-004-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (158, 5), (158, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (159, 4, 'CVS-PAN-004-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (159, 5), (159, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (160, 4, 'CVS-PAN-004-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (160, 5), (160, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (161, 4, 'CVS-PAN-004-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (161, 5), (161, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (162, 4, 'CVS-PAN-004-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (162, 6), (162, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (163, 4, 'CVS-PAN-004-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (163, 6), (163, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (164, 4, 'CVS-PAN-004-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (164, 6), (164, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (165, 4, 'CVS-PAN-004-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (165, 6), (165, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (166, 4, 'CVS-PAN-004-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (166, 6), (166, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (167, 4, 'CVS-PAN-004-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (167, 6), (167, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (168, 4, 'CVS-PAN-004-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (168, 6), (168, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (169, 5, 'CVS-PAN-005-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (169, 1), (169, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (170, 5, 'CVS-PAN-005-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (170, 1), (170, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (171, 5, 'CVS-PAN-005-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (171, 1), (171, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (172, 5, 'CVS-PAN-005-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (172, 1), (172, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (173, 5, 'CVS-PAN-005-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (173, 1), (173, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (174, 5, 'CVS-PAN-005-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (174, 1), (174, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (175, 5, 'CVS-PAN-005-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (175, 1), (175, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (176, 5, 'CVS-PAN-005-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (176, 2), (176, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (177, 5, 'CVS-PAN-005-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (177, 2), (177, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (178, 5, 'CVS-PAN-005-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (178, 2), (178, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (179, 5, 'CVS-PAN-005-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (179, 2), (179, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (180, 5, 'CVS-PAN-005-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (180, 2), (180, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (181, 5, 'CVS-PAN-005-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (181, 2), (181, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (182, 5, 'CVS-PAN-005-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (182, 2), (182, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (183, 5, 'CVS-PAN-005-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (183, 3), (183, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (184, 5, 'CVS-PAN-005-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (184, 3), (184, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (185, 5, 'CVS-PAN-005-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (185, 3), (185, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (186, 5, 'CVS-PAN-005-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (186, 3), (186, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (187, 5, 'CVS-PAN-005-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (187, 3), (187, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (188, 5, 'CVS-PAN-005-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (188, 3), (188, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (189, 5, 'CVS-PAN-005-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (189, 3), (189, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (190, 5, 'CVS-PAN-005-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (190, 4), (190, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (191, 5, 'CVS-PAN-005-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (191, 4), (191, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (192, 5, 'CVS-PAN-005-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (192, 4), (192, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (193, 5, 'CVS-PAN-005-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (193, 4), (193, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (194, 5, 'CVS-PAN-005-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (194, 4), (194, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (195, 5, 'CVS-PAN-005-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (195, 4), (195, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (196, 5, 'CVS-PAN-005-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (196, 4), (196, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (197, 5, 'CVS-PAN-005-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (197, 5), (197, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (198, 5, 'CVS-PAN-005-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (198, 5), (198, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (199, 5, 'CVS-PAN-005-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (199, 5), (199, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (200, 5, 'CVS-PAN-005-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (200, 5), (200, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (201, 5, 'CVS-PAN-005-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (201, 5), (201, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (202, 5, 'CVS-PAN-005-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (202, 5), (202, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (203, 5, 'CVS-PAN-005-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (203, 5), (203, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (204, 5, 'CVS-PAN-005-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (204, 6), (204, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (205, 5, 'CVS-PAN-005-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (205, 6), (205, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (206, 5, 'CVS-PAN-005-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (206, 6), (206, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (207, 5, 'CVS-PAN-005-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (207, 6), (207, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (208, 5, 'CVS-PAN-005-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (208, 6), (208, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (209, 5, 'CVS-PAN-005-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (209, 6), (209, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (210, 5, 'CVS-PAN-005-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (210, 6), (210, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (211, 6, 'CVS-PAN-006-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (211, 1), (211, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (212, 6, 'CVS-PAN-006-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (212, 1), (212, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (213, 6, 'CVS-PAN-006-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (213, 1), (213, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (214, 6, 'CVS-PAN-006-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (214, 1), (214, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (215, 6, 'CVS-PAN-006-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (215, 1), (215, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (216, 6, 'CVS-PAN-006-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (216, 1), (216, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (217, 6, 'CVS-PAN-006-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (217, 1), (217, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (218, 6, 'CVS-PAN-006-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (218, 2), (218, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (219, 6, 'CVS-PAN-006-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (219, 2), (219, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (220, 6, 'CVS-PAN-006-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (220, 2), (220, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (221, 6, 'CVS-PAN-006-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (221, 2), (221, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (222, 6, 'CVS-PAN-006-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (222, 2), (222, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (223, 6, 'CVS-PAN-006-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (223, 2), (223, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (224, 6, 'CVS-PAN-006-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (224, 2), (224, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (225, 6, 'CVS-PAN-006-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (225, 3), (225, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (226, 6, 'CVS-PAN-006-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (226, 3), (226, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (227, 6, 'CVS-PAN-006-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (227, 3), (227, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (228, 6, 'CVS-PAN-006-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (228, 3), (228, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (229, 6, 'CVS-PAN-006-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (229, 3), (229, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (230, 6, 'CVS-PAN-006-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (230, 3), (230, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (231, 6, 'CVS-PAN-006-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (231, 3), (231, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (232, 6, 'CVS-PAN-006-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (232, 4), (232, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (233, 6, 'CVS-PAN-006-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (233, 4), (233, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (234, 6, 'CVS-PAN-006-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (234, 4), (234, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (235, 6, 'CVS-PAN-006-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (235, 4), (235, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (236, 6, 'CVS-PAN-006-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (236, 4), (236, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (237, 6, 'CVS-PAN-006-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (237, 4), (237, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (238, 6, 'CVS-PAN-006-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (238, 4), (238, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (239, 6, 'CVS-PAN-006-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (239, 5), (239, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (240, 6, 'CVS-PAN-006-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (240, 5), (240, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (241, 6, 'CVS-PAN-006-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (241, 5), (241, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (242, 6, 'CVS-PAN-006-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (242, 5), (242, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (243, 6, 'CVS-PAN-006-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (243, 5), (243, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (244, 6, 'CVS-PAN-006-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (244, 5), (244, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (245, 6, 'CVS-PAN-006-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (245, 5), (245, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (246, 6, 'CVS-PAN-006-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (246, 6), (246, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (247, 6, 'CVS-PAN-006-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (247, 6), (247, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (248, 6, 'CVS-PAN-006-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (248, 6), (248, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (249, 6, 'CVS-PAN-006-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (249, 6), (249, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (250, 6, 'CVS-PAN-006-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (250, 6), (250, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (251, 6, 'CVS-PAN-006-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (251, 6), (251, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (252, 6, 'CVS-PAN-006-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (252, 6), (252, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (253, 7, 'CVS-PAN-007-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (253, 1), (253, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (254, 7, 'CVS-PAN-007-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (254, 1), (254, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (255, 7, 'CVS-PAN-007-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (255, 1), (255, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (256, 7, 'CVS-PAN-007-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (256, 1), (256, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (257, 7, 'CVS-PAN-007-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (257, 1), (257, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (258, 7, 'CVS-PAN-007-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (258, 1), (258, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (259, 7, 'CVS-PAN-007-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (259, 1), (259, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (260, 7, 'CVS-PAN-007-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (260, 2), (260, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (261, 7, 'CVS-PAN-007-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (261, 2), (261, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (262, 7, 'CVS-PAN-007-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (262, 2), (262, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (263, 7, 'CVS-PAN-007-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (263, 2), (263, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (264, 7, 'CVS-PAN-007-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (264, 2), (264, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (265, 7, 'CVS-PAN-007-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (265, 2), (265, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (266, 7, 'CVS-PAN-007-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (266, 2), (266, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (267, 7, 'CVS-PAN-007-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (267, 3), (267, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (268, 7, 'CVS-PAN-007-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (268, 3), (268, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (269, 7, 'CVS-PAN-007-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (269, 3), (269, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (270, 7, 'CVS-PAN-007-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (270, 3), (270, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (271, 7, 'CVS-PAN-007-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (271, 3), (271, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (272, 7, 'CVS-PAN-007-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (272, 3), (272, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (273, 7, 'CVS-PAN-007-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (273, 3), (273, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (274, 7, 'CVS-PAN-007-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (274, 4), (274, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (275, 7, 'CVS-PAN-007-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (275, 4), (275, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (276, 7, 'CVS-PAN-007-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (276, 4), (276, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (277, 7, 'CVS-PAN-007-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (277, 4), (277, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (278, 7, 'CVS-PAN-007-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (278, 4), (278, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (279, 7, 'CVS-PAN-007-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (279, 4), (279, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (280, 7, 'CVS-PAN-007-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (280, 4), (280, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (281, 7, 'CVS-PAN-007-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (281, 5), (281, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (282, 7, 'CVS-PAN-007-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (282, 5), (282, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (283, 7, 'CVS-PAN-007-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (283, 5), (283, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (284, 7, 'CVS-PAN-007-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (284, 5), (284, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (285, 7, 'CVS-PAN-007-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (285, 5), (285, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (286, 7, 'CVS-PAN-007-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (286, 5), (286, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (287, 7, 'CVS-PAN-007-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (287, 5), (287, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (288, 7, 'CVS-PAN-007-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (288, 6), (288, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (289, 7, 'CVS-PAN-007-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (289, 6), (289, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (290, 7, 'CVS-PAN-007-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (290, 6), (290, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (291, 7, 'CVS-PAN-007-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (291, 6), (291, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (292, 7, 'CVS-PAN-007-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (292, 6), (292, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (293, 7, 'CVS-PAN-007-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (293, 6), (293, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (294, 7, 'CVS-PAN-007-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (294, 6), (294, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (295, 8, 'CVS-PAN-008-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (295, 1), (295, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (296, 8, 'CVS-PAN-008-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (296, 1), (296, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (297, 8, 'CVS-PAN-008-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (297, 1), (297, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (298, 8, 'CVS-PAN-008-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (298, 1), (298, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (299, 8, 'CVS-PAN-008-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (299, 1), (299, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (300, 8, 'CVS-PAN-008-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (300, 1), (300, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (301, 8, 'CVS-PAN-008-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (301, 1), (301, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (302, 8, 'CVS-PAN-008-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (302, 2), (302, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (303, 8, 'CVS-PAN-008-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (303, 2), (303, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (304, 8, 'CVS-PAN-008-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (304, 2), (304, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (305, 8, 'CVS-PAN-008-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (305, 2), (305, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (306, 8, 'CVS-PAN-008-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (306, 2), (306, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (307, 8, 'CVS-PAN-008-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (307, 2), (307, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (308, 8, 'CVS-PAN-008-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (308, 2), (308, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (309, 8, 'CVS-PAN-008-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (309, 3), (309, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (310, 8, 'CVS-PAN-008-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (310, 3), (310, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (311, 8, 'CVS-PAN-008-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (311, 3), (311, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (312, 8, 'CVS-PAN-008-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (312, 3), (312, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (313, 8, 'CVS-PAN-008-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (313, 3), (313, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (314, 8, 'CVS-PAN-008-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (314, 3), (314, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (315, 8, 'CVS-PAN-008-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (315, 3), (315, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (316, 8, 'CVS-PAN-008-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (316, 4), (316, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (317, 8, 'CVS-PAN-008-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (317, 4), (317, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (318, 8, 'CVS-PAN-008-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (318, 4), (318, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (319, 8, 'CVS-PAN-008-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (319, 4), (319, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (320, 8, 'CVS-PAN-008-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (320, 4), (320, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (321, 8, 'CVS-PAN-008-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (321, 4), (321, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (322, 8, 'CVS-PAN-008-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (322, 4), (322, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (323, 8, 'CVS-PAN-008-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (323, 5), (323, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (324, 8, 'CVS-PAN-008-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (324, 5), (324, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (325, 8, 'CVS-PAN-008-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (325, 5), (325, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (326, 8, 'CVS-PAN-008-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (326, 5), (326, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (327, 8, 'CVS-PAN-008-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (327, 5), (327, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (328, 8, 'CVS-PAN-008-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (328, 5), (328, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (329, 8, 'CVS-PAN-008-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (329, 5), (329, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (330, 8, 'CVS-PAN-008-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (330, 6), (330, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (331, 8, 'CVS-PAN-008-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (331, 6), (331, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (332, 8, 'CVS-PAN-008-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (332, 6), (332, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (333, 8, 'CVS-PAN-008-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (333, 6), (333, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (334, 8, 'CVS-PAN-008-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (334, 6), (334, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (335, 8, 'CVS-PAN-008-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (335, 6), (335, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (336, 8, 'CVS-PAN-008-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (336, 6), (336, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (337, 9, 'CVS-PAN-009-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (337, 1), (337, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (338, 9, 'CVS-PAN-009-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (338, 1), (338, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (339, 9, 'CVS-PAN-009-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (339, 1), (339, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (340, 9, 'CVS-PAN-009-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (340, 1), (340, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (341, 9, 'CVS-PAN-009-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (341, 1), (341, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (342, 9, 'CVS-PAN-009-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (342, 1), (342, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (343, 9, 'CVS-PAN-009-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (343, 1), (343, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (344, 9, 'CVS-PAN-009-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (344, 2), (344, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (345, 9, 'CVS-PAN-009-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (345, 2), (345, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (346, 9, 'CVS-PAN-009-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (346, 2), (346, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (347, 9, 'CVS-PAN-009-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (347, 2), (347, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (348, 9, 'CVS-PAN-009-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (348, 2), (348, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (349, 9, 'CVS-PAN-009-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (349, 2), (349, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (350, 9, 'CVS-PAN-009-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (350, 2), (350, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (351, 9, 'CVS-PAN-009-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (351, 3), (351, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (352, 9, 'CVS-PAN-009-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (352, 3), (352, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (353, 9, 'CVS-PAN-009-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (353, 3), (353, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (354, 9, 'CVS-PAN-009-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (354, 3), (354, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (355, 9, 'CVS-PAN-009-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (355, 3), (355, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (356, 9, 'CVS-PAN-009-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (356, 3), (356, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (357, 9, 'CVS-PAN-009-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (357, 3), (357, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (358, 9, 'CVS-PAN-009-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (358, 4), (358, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (359, 9, 'CVS-PAN-009-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (359, 4), (359, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (360, 9, 'CVS-PAN-009-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (360, 4), (360, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (361, 9, 'CVS-PAN-009-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (361, 4), (361, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (362, 9, 'CVS-PAN-009-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (362, 4), (362, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (363, 9, 'CVS-PAN-009-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (363, 4), (363, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (364, 9, 'CVS-PAN-009-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (364, 4), (364, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (365, 9, 'CVS-PAN-009-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (365, 5), (365, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (366, 9, 'CVS-PAN-009-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (366, 5), (366, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (367, 9, 'CVS-PAN-009-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (367, 5), (367, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (368, 9, 'CVS-PAN-009-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (368, 5), (368, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (369, 9, 'CVS-PAN-009-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (369, 5), (369, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (370, 9, 'CVS-PAN-009-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (370, 5), (370, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (371, 9, 'CVS-PAN-009-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (371, 5), (371, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (372, 9, 'CVS-PAN-009-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (372, 6), (372, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (373, 9, 'CVS-PAN-009-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (373, 6), (373, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (374, 9, 'CVS-PAN-009-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (374, 6), (374, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (375, 9, 'CVS-PAN-009-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (375, 6), (375, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (376, 9, 'CVS-PAN-009-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (376, 6), (376, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (377, 9, 'CVS-PAN-009-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (377, 6), (377, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (378, 9, 'CVS-PAN-009-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (378, 6), (378, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (379, 10, 'CVS-PAN-010-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (379, 1), (379, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (380, 10, 'CVS-PAN-010-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (380, 1), (380, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (381, 10, 'CVS-PAN-010-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (381, 1), (381, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (382, 10, 'CVS-PAN-010-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (382, 1), (382, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (383, 10, 'CVS-PAN-010-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (383, 1), (383, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (384, 10, 'CVS-PAN-010-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (384, 1), (384, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (385, 10, 'CVS-PAN-010-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (385, 1), (385, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (386, 10, 'CVS-PAN-010-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (386, 2), (386, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (387, 10, 'CVS-PAN-010-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (387, 2), (387, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (388, 10, 'CVS-PAN-010-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (388, 2), (388, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (389, 10, 'CVS-PAN-010-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (389, 2), (389, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (390, 10, 'CVS-PAN-010-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (390, 2), (390, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (391, 10, 'CVS-PAN-010-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (391, 2), (391, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (392, 10, 'CVS-PAN-010-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (392, 2), (392, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (393, 10, 'CVS-PAN-010-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (393, 3), (393, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (394, 10, 'CVS-PAN-010-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (394, 3), (394, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (395, 10, 'CVS-PAN-010-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (395, 3), (395, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (396, 10, 'CVS-PAN-010-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (396, 3), (396, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (397, 10, 'CVS-PAN-010-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (397, 3), (397, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (398, 10, 'CVS-PAN-010-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (398, 3), (398, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (399, 10, 'CVS-PAN-010-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (399, 3), (399, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (400, 10, 'CVS-PAN-010-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (400, 4), (400, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (401, 10, 'CVS-PAN-010-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (401, 4), (401, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (402, 10, 'CVS-PAN-010-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (402, 4), (402, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (403, 10, 'CVS-PAN-010-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (403, 4), (403, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (404, 10, 'CVS-PAN-010-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (404, 4), (404, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (405, 10, 'CVS-PAN-010-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (405, 4), (405, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (406, 10, 'CVS-PAN-010-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (406, 4), (406, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (407, 10, 'CVS-PAN-010-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (407, 5), (407, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (408, 10, 'CVS-PAN-010-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (408, 5), (408, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (409, 10, 'CVS-PAN-010-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (409, 5), (409, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (410, 10, 'CVS-PAN-010-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (410, 5), (410, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (411, 10, 'CVS-PAN-010-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (411, 5), (411, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (412, 10, 'CVS-PAN-010-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (412, 5), (412, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (413, 10, 'CVS-PAN-010-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (413, 5), (413, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (414, 10, 'CVS-PAN-010-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (414, 6), (414, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (415, 10, 'CVS-PAN-010-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (415, 6), (415, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (416, 10, 'CVS-PAN-010-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (416, 6), (416, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (417, 10, 'CVS-PAN-010-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (417, 6), (417, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (418, 10, 'CVS-PAN-010-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (418, 6), (418, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (419, 10, 'CVS-PAN-010-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (419, 6), (419, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (420, 10, 'CVS-PAN-010-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (420, 6), (420, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (421, 11, 'CVS-PAN-011-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (421, 1), (421, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (422, 11, 'CVS-PAN-011-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (422, 1), (422, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (423, 11, 'CVS-PAN-011-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (423, 1), (423, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (424, 11, 'CVS-PAN-011-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (424, 1), (424, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (425, 11, 'CVS-PAN-011-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (425, 1), (425, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (426, 11, 'CVS-PAN-011-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (426, 1), (426, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (427, 11, 'CVS-PAN-011-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (427, 1), (427, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (428, 11, 'CVS-PAN-011-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (428, 2), (428, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (429, 11, 'CVS-PAN-011-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (429, 2), (429, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (430, 11, 'CVS-PAN-011-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (430, 2), (430, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (431, 11, 'CVS-PAN-011-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (431, 2), (431, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (432, 11, 'CVS-PAN-011-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (432, 2), (432, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (433, 11, 'CVS-PAN-011-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (433, 2), (433, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (434, 11, 'CVS-PAN-011-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (434, 2), (434, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (435, 11, 'CVS-PAN-011-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (435, 3), (435, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (436, 11, 'CVS-PAN-011-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (436, 3), (436, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (437, 11, 'CVS-PAN-011-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (437, 3), (437, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (438, 11, 'CVS-PAN-011-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (438, 3), (438, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (439, 11, 'CVS-PAN-011-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (439, 3), (439, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (440, 11, 'CVS-PAN-011-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (440, 3), (440, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (441, 11, 'CVS-PAN-011-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (441, 3), (441, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (442, 11, 'CVS-PAN-011-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (442, 4), (442, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (443, 11, 'CVS-PAN-011-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (443, 4), (443, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (444, 11, 'CVS-PAN-011-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (444, 4), (444, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (445, 11, 'CVS-PAN-011-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (445, 4), (445, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (446, 11, 'CVS-PAN-011-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (446, 4), (446, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (447, 11, 'CVS-PAN-011-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (447, 4), (447, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (448, 11, 'CVS-PAN-011-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (448, 4), (448, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (449, 11, 'CVS-PAN-011-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (449, 5), (449, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (450, 11, 'CVS-PAN-011-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (450, 5), (450, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (451, 11, 'CVS-PAN-011-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (451, 5), (451, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (452, 11, 'CVS-PAN-011-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (452, 5), (452, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (453, 11, 'CVS-PAN-011-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (453, 5), (453, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (454, 11, 'CVS-PAN-011-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (454, 5), (454, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (455, 11, 'CVS-PAN-011-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (455, 5), (455, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (456, 11, 'CVS-PAN-011-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (456, 6), (456, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (457, 11, 'CVS-PAN-011-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (457, 6), (457, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (458, 11, 'CVS-PAN-011-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (458, 6), (458, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (459, 11, 'CVS-PAN-011-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (459, 6), (459, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (460, 11, 'CVS-PAN-011-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (460, 6), (460, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (461, 11, 'CVS-PAN-011-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (461, 6), (461, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (462, 11, 'CVS-PAN-011-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (462, 6), (462, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (463, 12, 'CVS-PAN-012-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (463, 1), (463, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (464, 12, 'CVS-PAN-012-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (464, 1), (464, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (465, 12, 'CVS-PAN-012-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (465, 1), (465, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (466, 12, 'CVS-PAN-012-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (466, 1), (466, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (467, 12, 'CVS-PAN-012-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (467, 1), (467, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (468, 12, 'CVS-PAN-012-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (468, 1), (468, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (469, 12, 'CVS-PAN-012-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (469, 1), (469, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (470, 12, 'CVS-PAN-012-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (470, 2), (470, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (471, 12, 'CVS-PAN-012-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (471, 2), (471, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (472, 12, 'CVS-PAN-012-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (472, 2), (472, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (473, 12, 'CVS-PAN-012-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (473, 2), (473, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (474, 12, 'CVS-PAN-012-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (474, 2), (474, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (475, 12, 'CVS-PAN-012-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (475, 2), (475, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (476, 12, 'CVS-PAN-012-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (476, 2), (476, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (477, 12, 'CVS-PAN-012-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (477, 3), (477, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (478, 12, 'CVS-PAN-012-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (478, 3), (478, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (479, 12, 'CVS-PAN-012-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (479, 3), (479, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (480, 12, 'CVS-PAN-012-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (480, 3), (480, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (481, 12, 'CVS-PAN-012-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (481, 3), (481, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (482, 12, 'CVS-PAN-012-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (482, 3), (482, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (483, 12, 'CVS-PAN-012-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (483, 3), (483, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (484, 12, 'CVS-PAN-012-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (484, 4), (484, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (485, 12, 'CVS-PAN-012-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (485, 4), (485, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (486, 12, 'CVS-PAN-012-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (486, 4), (486, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (487, 12, 'CVS-PAN-012-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (487, 4), (487, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (488, 12, 'CVS-PAN-012-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (488, 4), (488, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (489, 12, 'CVS-PAN-012-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (489, 4), (489, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (490, 12, 'CVS-PAN-012-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (490, 4), (490, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (491, 12, 'CVS-PAN-012-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (491, 5), (491, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (492, 12, 'CVS-PAN-012-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (492, 5), (492, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (493, 12, 'CVS-PAN-012-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (493, 5), (493, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (494, 12, 'CVS-PAN-012-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (494, 5), (494, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (495, 12, 'CVS-PAN-012-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (495, 5), (495, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (496, 12, 'CVS-PAN-012-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (496, 5), (496, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (497, 12, 'CVS-PAN-012-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (497, 5), (497, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (498, 12, 'CVS-PAN-012-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (498, 6), (498, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (499, 12, 'CVS-PAN-012-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (499, 6), (499, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (500, 12, 'CVS-PAN-012-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (500, 6), (500, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (501, 12, 'CVS-PAN-012-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (501, 6), (501, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (502, 12, 'CVS-PAN-012-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (502, 6), (502, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (503, 12, 'CVS-PAN-012-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (503, 6), (503, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (504, 12, 'CVS-PAN-012-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (504, 6), (504, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (505, 13, 'CVS-PAN-013-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (505, 1), (505, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (506, 13, 'CVS-PAN-013-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (506, 1), (506, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (507, 13, 'CVS-PAN-013-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (507, 1), (507, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (508, 13, 'CVS-PAN-013-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (508, 1), (508, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (509, 13, 'CVS-PAN-013-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (509, 1), (509, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (510, 13, 'CVS-PAN-013-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (510, 1), (510, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (511, 13, 'CVS-PAN-013-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (511, 1), (511, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (512, 13, 'CVS-PAN-013-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (512, 2), (512, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (513, 13, 'CVS-PAN-013-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (513, 2), (513, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (514, 13, 'CVS-PAN-013-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (514, 2), (514, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (515, 13, 'CVS-PAN-013-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (515, 2), (515, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (516, 13, 'CVS-PAN-013-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (516, 2), (516, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (517, 13, 'CVS-PAN-013-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (517, 2), (517, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (518, 13, 'CVS-PAN-013-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (518, 2), (518, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (519, 13, 'CVS-PAN-013-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (519, 3), (519, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (520, 13, 'CVS-PAN-013-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (520, 3), (520, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (521, 13, 'CVS-PAN-013-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (521, 3), (521, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (522, 13, 'CVS-PAN-013-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (522, 3), (522, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (523, 13, 'CVS-PAN-013-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (523, 3), (523, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (524, 13, 'CVS-PAN-013-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (524, 3), (524, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (525, 13, 'CVS-PAN-013-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (525, 3), (525, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (526, 13, 'CVS-PAN-013-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (526, 4), (526, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (527, 13, 'CVS-PAN-013-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (527, 4), (527, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (528, 13, 'CVS-PAN-013-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (528, 4), (528, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (529, 13, 'CVS-PAN-013-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (529, 4), (529, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (530, 13, 'CVS-PAN-013-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (530, 4), (530, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (531, 13, 'CVS-PAN-013-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (531, 4), (531, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (532, 13, 'CVS-PAN-013-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (532, 4), (532, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (533, 13, 'CVS-PAN-013-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (533, 5), (533, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (534, 13, 'CVS-PAN-013-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (534, 5), (534, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (535, 13, 'CVS-PAN-013-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (535, 5), (535, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (536, 13, 'CVS-PAN-013-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (536, 5), (536, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (537, 13, 'CVS-PAN-013-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (537, 5), (537, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (538, 13, 'CVS-PAN-013-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (538, 5), (538, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (539, 13, 'CVS-PAN-013-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (539, 5), (539, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (540, 13, 'CVS-PAN-013-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (540, 6), (540, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (541, 13, 'CVS-PAN-013-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (541, 6), (541, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (542, 13, 'CVS-PAN-013-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (542, 6), (542, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (543, 13, 'CVS-PAN-013-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (543, 6), (543, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (544, 13, 'CVS-PAN-013-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (544, 6), (544, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (545, 13, 'CVS-PAN-013-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (545, 6), (545, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (546, 13, 'CVS-PAN-013-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (546, 6), (546, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (547, 14, 'CVS-PAN-014-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (547, 1), (547, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (548, 14, 'CVS-PAN-014-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (548, 1), (548, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (549, 14, 'CVS-PAN-014-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (549, 1), (549, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (550, 14, 'CVS-PAN-014-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (550, 1), (550, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (551, 14, 'CVS-PAN-014-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (551, 1), (551, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (552, 14, 'CVS-PAN-014-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (552, 1), (552, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (553, 14, 'CVS-PAN-014-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (553, 1), (553, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (554, 14, 'CVS-PAN-014-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (554, 2), (554, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (555, 14, 'CVS-PAN-014-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (555, 2), (555, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (556, 14, 'CVS-PAN-014-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (556, 2), (556, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (557, 14, 'CVS-PAN-014-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (557, 2), (557, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (558, 14, 'CVS-PAN-014-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (558, 2), (558, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (559, 14, 'CVS-PAN-014-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (559, 2), (559, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (560, 14, 'CVS-PAN-014-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (560, 2), (560, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (561, 14, 'CVS-PAN-014-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (561, 3), (561, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (562, 14, 'CVS-PAN-014-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (562, 3), (562, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (563, 14, 'CVS-PAN-014-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (563, 3), (563, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (564, 14, 'CVS-PAN-014-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (564, 3), (564, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (565, 14, 'CVS-PAN-014-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (565, 3), (565, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (566, 14, 'CVS-PAN-014-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (566, 3), (566, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (567, 14, 'CVS-PAN-014-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (567, 3), (567, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (568, 14, 'CVS-PAN-014-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (568, 4), (568, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (569, 14, 'CVS-PAN-014-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (569, 4), (569, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (570, 14, 'CVS-PAN-014-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (570, 4), (570, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (571, 14, 'CVS-PAN-014-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (571, 4), (571, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (572, 14, 'CVS-PAN-014-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (572, 4), (572, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (573, 14, 'CVS-PAN-014-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (573, 4), (573, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (574, 14, 'CVS-PAN-014-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (574, 4), (574, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (575, 14, 'CVS-PAN-014-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (575, 5), (575, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (576, 14, 'CVS-PAN-014-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (576, 5), (576, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (577, 14, 'CVS-PAN-014-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (577, 5), (577, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (578, 14, 'CVS-PAN-014-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (578, 5), (578, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (579, 14, 'CVS-PAN-014-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (579, 5), (579, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (580, 14, 'CVS-PAN-014-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (580, 5), (580, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (581, 14, 'CVS-PAN-014-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (581, 5), (581, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (582, 14, 'CVS-PAN-014-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (582, 6), (582, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (583, 14, 'CVS-PAN-014-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (583, 6), (583, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (584, 14, 'CVS-PAN-014-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (584, 6), (584, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (585, 14, 'CVS-PAN-014-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (585, 6), (585, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (586, 14, 'CVS-PAN-014-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (586, 6), (586, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (587, 14, 'CVS-PAN-014-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (587, 6), (587, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (588, 14, 'CVS-PAN-014-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (588, 6), (588, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (589, 15, 'CVS-PAN-015-S1-UNFRAMED', 49.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (589, 1), (589, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (590, 15, 'CVS-PAN-015-S1-BLACK', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (590, 1), (590, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (591, 15, 'CVS-PAN-015-S1-WHITE', 78.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (591, 1), (591, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (592, 15, 'CVS-PAN-015-S1-GOLD', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (592, 1), (592, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (593, 15, 'CVS-PAN-015-S1-SILVER', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (593, 1), (593, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (594, 15, 'CVS-PAN-015-S1-WALNUT', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (594, 1), (594, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (595, 15, 'CVS-PAN-015-S1-OAK', 88.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (595, 1), (595, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (596, 15, 'CVS-PAN-015-S2-UNFRAMED', 69.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (596, 2), (596, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (597, 15, 'CVS-PAN-015-S2-BLACK', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (597, 2), (597, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (598, 15, 'CVS-PAN-015-S2-WHITE', 98.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (598, 2), (598, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (599, 15, 'CVS-PAN-015-S2-GOLD', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (599, 2), (599, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (600, 15, 'CVS-PAN-015-S2-SILVER', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (600, 2), (600, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (601, 15, 'CVS-PAN-015-S2-WALNUT', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (601, 2), (601, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (602, 15, 'CVS-PAN-015-S2-OAK', 108.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (602, 2), (602, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (603, 15, 'CVS-PAN-015-S3-UNFRAMED', 89.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (603, 3), (603, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (604, 15, 'CVS-PAN-015-S3-BLACK', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (604, 3), (604, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (605, 15, 'CVS-PAN-015-S3-WHITE', 118.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (605, 3), (605, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (606, 15, 'CVS-PAN-015-S3-GOLD', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (606, 3), (606, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (607, 15, 'CVS-PAN-015-S3-SILVER', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (607, 3), (607, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (608, 15, 'CVS-PAN-015-S3-WALNUT', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (608, 3), (608, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (609, 15, 'CVS-PAN-015-S3-OAK', 128.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (609, 3), (609, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (610, 15, 'CVS-PAN-015-S4-UNFRAMED', 119.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (610, 4), (610, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (611, 15, 'CVS-PAN-015-S4-BLACK', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (611, 4), (611, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (612, 15, 'CVS-PAN-015-S4-WHITE', 148.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (612, 4), (612, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (613, 15, 'CVS-PAN-015-S4-GOLD', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (613, 4), (613, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (614, 15, 'CVS-PAN-015-S4-SILVER', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (614, 4), (614, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (615, 15, 'CVS-PAN-015-S4-WALNUT', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (615, 4), (615, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (616, 15, 'CVS-PAN-015-S4-OAK', 158.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (616, 4), (616, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (617, 15, 'CVS-PAN-015-S5-UNFRAMED', 149.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (617, 5), (617, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (618, 15, 'CVS-PAN-015-S5-BLACK', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (618, 5), (618, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (619, 15, 'CVS-PAN-015-S5-WHITE', 178.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (619, 5), (619, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (620, 15, 'CVS-PAN-015-S5-GOLD', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (620, 5), (620, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (621, 15, 'CVS-PAN-015-S5-SILVER', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (621, 5), (621, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (622, 15, 'CVS-PAN-015-S5-WALNUT', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (622, 5), (622, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (623, 15, 'CVS-PAN-015-S5-OAK', 188.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (623, 5), (623, 13) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (624, 15, 'CVS-PAN-015-S6-UNFRAMED', 189.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (624, 6), (624, 7) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (625, 15, 'CVS-PAN-015-S6-BLACK', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (625, 6), (625, 8) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (626, 15, 'CVS-PAN-015-S6-WHITE', 218.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (626, 6), (626, 9) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (627, 15, 'CVS-PAN-015-S6-GOLD', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (627, 6), (627, 10) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (628, 15, 'CVS-PAN-015-S6-SILVER', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (628, 6), (628, 11) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (629, 15, 'CVS-PAN-015-S6-WALNUT', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (629, 6), (629, 12) ON CONFLICT DO NOTHING;
INSERT INTO product_variant (product_variant_id, product_id, sku, price, quantity_in_stock, disabled) VALUES (630, 15, 'CVS-PAN-015-S6-OAK', 228.00, 100, FALSE) ON CONFLICT (product_variant_id) DO UPDATE SET price = EXCLUDED.price;
INSERT INTO product_variant_property (product_variant_id, variation_option_id) VALUES (630, 6), (630, 13) ON CONFLICT DO NOTHING;

-- 11. Synchronize Sequences

SELECT setval('public.role_role_id_seq', COALESCE((SELECT MAX(role_id) FROM role), 1));
SELECT setval('public.address_address_id_seq', COALESCE((SELECT MAX(address_id) FROM address), 1));
SELECT setval('public.shop_user_user_id_seq', COALESCE((SELECT MAX(user_id) FROM shop_user), 1));
SELECT setval('public.shipping_method_shipping_method_id_seq', COALESCE((SELECT MAX(shipping_method_id) FROM shipping_method), 1));
SELECT setval('public.shipping_method_option_id_seq', COALESCE((SELECT MAX(id) FROM shipping_method_option), 1));
SELECT setval('public.category_category_id_seq', COALESCE((SELECT MAX(category_id) FROM category), 1));
SELECT setval('public.variation_variation_id_seq', COALESCE((SELECT MAX(variation_id) FROM variation), 1));
SELECT setval('public.variation_option_variation_option_id_seq', COALESCE((SELECT MAX(variation_option_id) FROM variation_option), 1));
SELECT setval('public.product_product_id_seq', COALESCE((SELECT MAX(product_id) FROM product), 1));
SELECT setval('public.product_image_product_image_id_seq', COALESCE((SELECT MAX(product_image_id) FROM product_image), 1));
SELECT setval('public.product_variant_product_variant_id_seq', COALESCE((SELECT MAX(product_variant_id) FROM product_variant), 1));

COMMIT;
