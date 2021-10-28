-- Remove any existing database and user.
DROP DATABASE IF EXISTS music_record;
DROP USER IF EXISTS music_record_user@localhost;

-- Create music_record database and user. Ensure Unicode is fully supported.
CREATE DATABASE music_record CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER music_record_user@localhost IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON music_record.* TO music_record_user@localhost;