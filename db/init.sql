CREATE TYPE enum_yesno AS ENUM ('YES', 'NO');
SET TIME ZONE 'Africa/Nairobi';


CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float, units varchar)
RETURNS float AS $dist$
	DECLARE
		dist float = 0;
		radlat1 float;
		radlat2 float;
		theta float;
		radtheta float;
	BEGIN
		IF lat1 = lat2 OR lon1 = lon2
			THEN RETURN dist;
		ELSE
			radlat1 = pi() * lat1 / 180;
			radlat2 = pi() * lat2 / 180;
			theta = lon1 - lon2;
			radtheta = pi() * theta / 180;
			dist = sin(radlat1) * sin(radlat2) + cos(radlat1) * cos(radlat2) * cos(radtheta);

			IF dist > 1 THEN dist = 1; END IF;

			dist = acos(dist);
			dist = dist * 180 / pi();
			dist = dist * 60 * 1.1515;

			IF units = 'K' THEN dist = dist * 1.609344; END IF;
			IF units = 'N' THEN dist = dist * 0.8684; END IF;

			RETURN dist;
		END IF;
	END;
$dist$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
	id SERIAL NOT NULL PRIMARY KEY,
	username VARCHAR(255) NOT NULL,
	firstname VARCHAR(255) NOT NULL,
	lastname VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	phone_number VARCHAR(20),
	password VARCHAR(255) NOT NULL,
	verified enum_yesno DEFAULT 'NO',
	online enum_yesno EFAULT 'NO',
	last_connection TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_verify (
	running_id SERIAL NOT NULL PRIMARY KEY,
	user_id INT NOT NULL,
	email VARCHAR(255) NOT NULL,
	verify_code INT NOT NULL,
	expire_time TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + interval '30 minutes'),
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset (
	running_id SERIAL NOT NULL PRIMARY KEY,
	user_id INT NOT NULL,
	reset_code VARCHAR(255) NOT NULL,
	expire_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
	running_id SERIAL NOT NULL PRIMARY KEY,
	user_id INT NOT NULL,
	gender VARCHAR(255) NOT NULL,
	age INT NOT NULL,
	sexual_pref VARCHAR(255) NOT NULL,
	biography VARCHAR(65535) NOT NULL,
	fame_rating INT NOT NULL DEFAULT 0,
	user_location VARCHAR(255) NOT NULL,
	IP_location POINT NOT NULL DEFAULT '(0, 0)',
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_pictures (
	picture_id SERIAL NOT NULL PRIMARY KEY,
	user_id INT NOT NULL,
	picture_data TEXT NOT NULL,
	profile_pic enum_yesno DEFAULT 'NO',
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
	running_id SERIAL NOT NULL PRIMARY KEY,
	liker_id INT NOT NULL,
	target_id INT NOT NULL,
	liketime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (liker_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS connections (
	connection_id SERIAL NOT NULL PRIMARY KEY,
	user1_id INT NOT NULL,
	user2_id INT NOT NULL,
	FOREIGN KEY (user1_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blocks (
	block_id SERIAL NOT NULL PRIMARY KEY,
	blocker_id INT NOT NULL,
	target_id INT NOT NULL,
	FOREIGN KEY (blocker_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
	tag_id SERIAL NOT NULL PRIMARY KEY,
	tag_content VARCHAR(255) NOT NULL,
	tagged_users INT[] DEFAULT array[]::INT[]
);

CREATE TABLE IF NOT EXISTS chat (
	chat_id SERIAL NOT NULL PRIMARY KEY,
	connection_id INT NOT NULL,
	sender_id INT NOT NULL,
	message TEXT NOT NULL,
	read enum_yesno DEFAULT 'NO',
	time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (connection_id) REFERENCES connections (connection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS watches (
	watch_id SERIAL NOT NULL PRIMARY KEY,
	watcher_id INT NOT NULL,
	target_id INT NOT NULL,
	time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (watcher_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
	report_id SERIAL NOT NULL PRIMARY KEY,
	sender_id INT NOT NULL,
	target_id INT NOT NULL,
	time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
	notification_id SERIAL NOT NULL PRIMARY KEY,
	user_id INT NOT NULL,
	sender_id INT NOT NULL,
	notification_text VARCHAR(255) NOT NULL,
	redirect_path VARCHAR(255),
	read enum_yesno DEFAULT 'NO',
	time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fame_rates (
	famerate_id SERIAL NOT NULL PRIMARY KEY,
	user_id INT NOT NULL,
	setup_pts INT NOT NULL DEFAULT 0,
	picture_pts INT NOT NULL DEFAULT 0,
	tag_pts INT NOT NULL DEFAULT 0,
	like_pts INT NOT NULL DEFAULT 0,
	connection_pts INT NOT NULL DEFAULT 0,
	total_pts INT NOT NULL DEFAULT 0,
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Table: dating_categories
CREATE TABLE IF NOT EXISTS dating_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    gender_restriction VARCHAR(20),
    allow_login BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_categories
CREATE TABLE IF NOT EXISTS user_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES dating_categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.socials
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,              -- e.g. 'Facebook', 'Instagram', 'Twitter'
    handle VARCHAR(150) NOT NULL,               -- e.g. '@steve'
    profile_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'TIP', 'PAY', 'REFUND');

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type transaction_type NOT NULL,   -- deposit, tip, pay, refund
    reference_id INTEGER,                         -- optional: links to a category, transaction, etc.
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('CREDIT', 'DEBIT')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ================================
-- ATCHA DEMO SEED DATA
-- ================================

-- 1️⃣ Users
INSERT INTO users (username, firstname, lastname, email, password, verified)
VALUES
  ('john_doe', 'John', 'Doe', 'john@example.com', 'hashed_password1', 'YES'),
  ('jane_smith', 'Jane', 'Smith', 'jane@example.com', 'hashed_password2', 'YES'),
  ('mike_brown', 'Mike', 'Brown', 'mike@example.com', 'hashed_password3', 'YES'),
  ('susan_lee', 'Susan', 'Lee', 'susan@example.com', 'hashed_password4', 'YES')
ON CONFLICT DO NOTHING;

-- 2️⃣ User Settings
INSERT INTO user_settings (user_id, gender, age, sexual_pref, biography, fame_rating, user_location, IP_location)
VALUES
  (1, 'male', 29, 'female', 'Adventurous traveler and foodie.', 50, 'Nairobi', POINT(36.8219, -1.2921)),
  (2, 'female', 26, 'male', 'Love music, dogs and coding.', 60, 'Nairobi', POINT(36.8219, -1.2921)),
  (3, 'male', 32, 'female', 'Fitness and gaming enthusiast.', 40, 'Mombasa', POINT(39.6682, -4.0435)),
  (4, 'female', 27, 'female', 'Art lover and traveler.', 55, 'Kisumu', POINT(34.7617, -0.0917))
ON CONFLICT DO NOTHING;

-- 3️⃣ Pictures
INSERT INTO user_pictures (user_id, picture_data, profile_pic)
VALUES
  (1, 'john_pic.jpg', 'YES'),
  (2, 'jane_pic.jpg', 'YES'),
  (3, 'mike_pic.jpg', 'YES'),
  (4, 'susan_pic.jpg', 'YES')
ON CONFLICT DO NOTHING;



-- 6️⃣ Likes
INSERT INTO likes (liker_id, target_id)
VALUES
  (1, 2),
  (2, 1),
  (3, 4),
  (4, 3)
ON CONFLICT DO NOTHING;

-- 7️⃣ Connections (John ↔ Jane, Mike ↔ Susan)
INSERT INTO connections (user1_id, user2_id)
VALUES
  (1, 2),
  (3, 4)
ON CONFLICT DO NOTHING;

-- 8️⃣ Tags
INSERT INTO tags (tag_content, tagged_users)
VALUES
  ('traveler', '{1,4}'),
  ('fitness', '{3}'),
  ('music', '{2}')
ON CONFLICT (tag_content) DO NOTHING;

-- 9️⃣ Chat Messages
INSERT INTO chat (connection_id, sender_id, message, read)
VALUES
  (1, 1, 'Hey Jane, how’s your day?', 'NO'),
  (1, 2, 'Doing great! How about you?', 'NO'),
  (2, 3, 'Hi Susan!', 'YES'),
  (2, 4, 'Hey Mike!', 'YES')
ON CONFLICT DO NOTHING;

-- 🔟 Fame Rates
INSERT INTO fame_rates (user_id, setup_pts, picture_pts, tag_pts, like_pts, connection_pts, total_pts)
VALUES
  (1, 10, 10, 5, 20, 10, 55),
  (2, 10, 10, 5, 20, 10, 55),
  (3, 10, 10, 5, 10, 10, 45),
  (4, 10, 10, 5, 10, 10, 45)
ON CONFLICT DO NOTHING;

-- 11️⃣ Notifications
INSERT INTO notifications (user_id, sender_id, notification_text, redirect_path)
VALUES
  (1, 2, 'Jane liked your profile', '/profile/2'),
  (2, 1, 'John liked your profile', '/profile/1'),
  (3, 4, 'Susan viewed your profile', '/profile/4')
ON CONFLICT DO NOTHING;

-- 12️⃣ Watches (profile views)
INSERT INTO watches (watcher_id, target_id)
VALUES
  (1, 2),
  (2, 1),
  (3, 4)
ON CONFLICT DO NOTHING;

-- 13️⃣ Reports (test moderation data)
INSERT INTO reports (sender_id, target_id)
VALUES
  (3, 1),
  (4, 2)
ON CONFLICT DO NOTHING;

-- 14️⃣ Blocks
INSERT INTO blocks (blocker_id, target_id)
VALUES
  (2, 3)
ON CONFLICT DO NOTHING;

-- 15️⃣ Email Verification & Reset (test data)
INSERT INTO email_verify (user_id, email, verify_code)
VALUES
  (1, 'john@example.com', 123456)
ON CONFLICT DO NOTHING;

INSERT INTO password_reset (user_id, reset_code)
VALUES
  (1, 'abc123')
ON CONFLICT DO NOTHING;
INSERT INTO public.user_categories (user_id, category_id, is_active, created_at)
VALUES
-- User 1
(1, 1, true, NOW()),
(1, 2, true, NOW()),
(1, 3, false, NOW()),

-- User 2
(2, 1, true, NOW()),
(2, 2, false, NOW()),
(2, 4, true, NOW()),

-- User 3
(3, 1, true, NOW()),
(3, 5, true, NOW()),
(3, 3, true, NOW()),

-- User 4
(4, 2, true, NOW()),
(4, 3, true, NOW()),
(4, 4, false, NOW()),

-- User 5
(5, 1, true, NOW()),
(5, 2, true, NOW()),
(5, 5, true, NOW()),

-- User 6
(6, 3, true, NOW()),
(6, 4, true, NOW()),
(6, 5, true, NOW()),

-- User 7
(7, 1, false, NOW()),
(7, 2, true, NOW()),
(7, 3, true, NOW()),

-- User 8
(8, 1, true, NOW()),
(8, 5, false, NOW()),
(8, 4, true, NOW()),

-- User 9
(9, 2, true, NOW()),
(9, 3, false, NOW()),
(9, 5, true, NOW()),

-- User 10
(10, 1, true, NOW()),
(10, 4, true, NOW()),
(10, 5, true, NOW());

