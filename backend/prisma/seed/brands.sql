DELETE FROM "brand";
SELECT setval(pg_get_serial_sequence('"brand"', 'id'), 1, false);

INSERT INTO "brand" (id, name, description, logo_url, website, created_at, updated_at) VALUES
(1, 'Apple', 'Thương hiệu công nghệ hàng đầu thế giới', 'https://cdn2.cellphones.com.vn/x/media/logo/apple.png', 'https://www.apple.com', NOW(), NOW()),
(2, 'Samsung', 'Tập đoàn điện tử hàng đầu Hàn Quốc', 'https://cdn2.cellphones.com.vn/x/media/logo/samsung.png', 'https://www.samsung.com', NOW(), NOW()),
(3, 'Xiaomi', 'Thương hiệu công nghệ Trung Quốc', 'https://cdn2.cellphones.com.vn/x/media/logo/xiaomi.png', 'https://www.mi.com', NOW(), NOW()),
(4, 'OPPO', 'Thương hiệu điện thoại OPPO', 'https://cdn2.cellphones.com.vn/x/media/logo/oppo.png', 'https://www.oppo.com', NOW(), NOW()),
(5, 'Vivo', 'Thương hiệu điện thoại Vivo', 'https://cdn2.cellphones.com.vn/x/media/logo/vivo.png', 'https://www.vivo.com', NOW(), NOW()),
(6, 'Realme', 'Thương hiệu điện thoại giá tốt', 'https://cdn2.cellphones.com.vn/x/media/logo/realme.png', 'https://www.realme.com', NOW(), NOW()),
(7, 'TECNO', 'Thương hiệu điện thoại TECNO', NULL, NULL, NOW(), NOW()),
(8, 'ASUS', 'Thương hiệu máy tính và linh kiện ASUS', NULL, 'https://www.asus.com', NOW(), NOW()),
(9, 'Lenovo', 'Thương hiệu laptop Lenovo', NULL, 'https://www.lenovo.com', NOW(), NOW());

-- set sequence to max id
SELECT setval(pg_get_serial_sequence('"brand"', 'id'), 9);
