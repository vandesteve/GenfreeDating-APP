
-- 4️⃣ Categories
INSERT INTO dating_categories (name, description, gender_restriction, allow_login)
VALUES
  ('Straight', 'Men seeking women and vice versa', 'both', TRUE),
  ('Gay', 'Men seeking men', 'male', TRUE),
  ('Lesbian', 'Women seeking women', 'female', TRUE),
  ('Bisexual', 'Open to both genders', 'both', TRUE)
ON CONFLICT (name) DO NOTHING;