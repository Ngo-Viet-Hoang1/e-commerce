-- Seed Categories with explicit IDs
-- This ensures consistent IDs across different environments

-- Delete existing categories to ensure clean slate
DELETE FROM "Category";

-- Reset sequence before insert
SELECT setval(pg_get_serial_sequence('"Category"', 'id'), 1, false);

INSERT INTO "Category" (id, name, slug, description, "parentId", "createdAt", "updatedAt") VALUES
(1, 'Điện thoại', 'dien-thoai', 'Điện thoại thông minh các loại', NULL, NOW(), NOW()),
(2, 'Laptop', 'laptop', 'Laptop, máy tính xách tay', NULL, NOW(), NOW()),
(3, 'Tablet', 'tablet', 'Máy tính bảng', NULL, NOW(), NOW()),
(4, 'Phụ kiện', 'phu-kien', 'Phụ kiện điện thoại, laptop', NULL, NOW(), NOW()),
(5, 'Smartwatch', 'smartwatch', 'Đồng hồ thông minh', NULL, NOW(), NOW()),
(6, 'Tai nghe', 'tai-nghe', 'Tai nghe có dây, không dây', NULL, NOW(), NOW());

-- Reset sequence to continue from max ID
SELECT setval(pg_get_serial_sequence('"Category"', 'id'), COALESCE(MAX(id), 1)) FROM "Category";
