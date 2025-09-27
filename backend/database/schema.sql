-- Drops existing tables to ensure a clean slate when you re-run db_setup.py
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS Users;

-- =============================================
-- Users Table
-- Based on your User class in protobackend.py
-- =============================================
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,             -- From your User.email attribute
    password_hash TEXT NOT NULL,            -- Necessary for secure login
    display_name TEXT NOT NULL,             -- From your User.name attribute
    year INTEGER,                           -- From your User.year attribute
    major TEXT,                             -- From your User.major attribute
    is_verified INTEGER DEFAULT 0,          -- For your email verification flow
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Posts Table
-- Based on your Post class in protobackend.py
-- =============================================
CREATE TABLE Posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,             -- Replaces 'author_user', links to a User's id
    location TEXT NOT NULL,                 -- From your Post.location attribute
    activity TEXT NOT NULL,                 -- From your Post.course attribute
    people_needed INTEGER NOT NULL,         -- From your Post.group_size_max attribute
    people_joined INTEGER DEFAULT 0,        -- From your Post.group_current attribute
    is_active INTEGER DEFAULT 1,            -- From your Post.show_in_results attribute
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, -- From your Post.time_creation attribute
    expires_at TEXT NOT NULL,               -- From your Post.time_expiration attribute
    FOREIGN KEY (author_id) REFERENCES Users (id)
);

-- =============================================
-- Messages Table
-- A new table for your chat functionality
-- =============================================
CREATE TABLE Messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,               -- Links the message to a specific Post's study group
    sender_id INTEGER NOT NULL,             -- Links the message to the User who sent it
    content TEXT NOT NULL,                  -- The actual message text
    sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Posts (id),
    FOREIGN KEY (sender_id) REFERENCES Users (id)
);