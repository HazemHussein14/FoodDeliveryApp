-- Add default settings
INSERT INTO settings (key, value, created_at, updated_at) 
VALUES 
    ('max_menus_per_restaurant', '3', NOW(), NOW())
ON CONFLICT (key) DO NOTHING; 