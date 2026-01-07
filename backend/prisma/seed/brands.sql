DELETE FROM "brand";
SELECT setval(pg_get_serial_sequence('"brand"', 'id'), 1, false);

INSERT INTO "brand" (id, name, description, logo_url, website, created_at, updated_at) VALUES
(1, 'Apple', 'Thương hiệu công nghệ hàng đầu thế giới', 'https://i.pinimg.com/1200x/5d/45/f7/5d45f79b9097fc4f8f717f55b52c8a3d.jpg', 'https://www.apple.com', NOW(), NOW()),
(2, 'Samsung', 'Tập đoàn điện tử hàng đầu Hàn Quốc', 'https://i.pinimg.com/736x/d5/63/7c/d5637cf25d7d2a6d4a9cfb08f7756032.jpg', 'https://www.samsung.com', NOW(), NOW()),
(3, 'Xiaomi', 'Thương hiệu công nghệ Trung Quốc', 'https://i.pinimg.com/736x/21/9a/ba/219aba5a7e74091741fef401deb08f43.jpg', 'https://www.mi.com', NOW(), NOW()),
(4, 'OPPO', 'Thương hiệu điện thoại OPPO', 'https://i.pinimg.com/1200x/4b/6a/51/4b6a5172d8aaf0fab1f1e406bb0a21ba.jpg', 'https://www.oppo.com', NOW(), NOW()),
(5, 'Vivo', 'Thương hiệu điện thoại Vivo', 'https://i.pinimg.com/736x/46/17/3b/46173b6dd05fb0295da1f1434e275fb5.jpg', 'https://www.vivo.com', NOW(), NOW()),
(6, 'Realme', 'Thương hiệu điện thoại giá tốt', 'https://i.pinimg.com/1200x/70/41/15/7041158fa345eedc223fd4056af2585f.jpg', 'https://www.realme.com', NOW(), NOW()),
(7, 'TECNO', 'Thương hiệu điện thoại TECNO', 'https://i.pinimg.com/736x/f1/e3/3b/f1e33be3d27950524506f46aa9d1b895.jpg', NULL, NOW(), NOW()),
(8, 'ASUS', 'Thương hiệu máy tính và linh kiện ASUS', 'https://i.pinimg.com/736x/86/e0/50/86e05042b9fae73b0c12517ee5cef558.jpg', 'https://www.asus.com', NOW(), NOW()),
(9, 'Lenovo', 'Thương hiệu laptop Lenovo', 'https://i.pinimg.com/1200x/79/44/81/7944813abdb01bba2e43d3b6de9f1ff3.jpg', 'https://www.lenovo.com', NOW(), NOW());

-- set sequence to max id
SELECT setval(pg_get_serial_sequence('"brand"', 'id'), 9);
