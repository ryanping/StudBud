-- backend/database/schema.sql

DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    year INTEGER,
    major TEXT
    major TEXT,
    verification_code TEXT,
    is_verified INTEGER DEFAULT 0
);

CREATE TABLE Posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    location TEXT NOT NULL,
    activity TEXT NOT NULL,                 -- From your 'course' attribute
    people_needed INTEGER NOT NULL,         -- From your 'group_size_max' attribute
    people_joined INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,            -- From your 'show_in_results' attribute
    created_at TEXT NOT NULL,               -- Stores the full timestamp
    expires_at TEXT NOT NULL,               -- Stores the full timestamp of when it expires
    FOREIGN KEY (author_id) REFERENCES Users (id)
);

CREATE TABLE Messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Posts (id),
    FOREIGN KEY (sender_id) REFERENCES Users (id)
);