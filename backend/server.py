# backend/server.py

import os
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv

from protobackend import User, Post # Import your updated classes

# --- APP CONFIGURATION ---
load_dotenv()
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# --- DATABASE HELPER ---
def get_db_connection():
    conn = sqlite3.connect('database/studbud.db')
    conn.row_factory = sqlite3.Row
    return conn

# --- API ROUTES ---

@app.route('/api/register', methods=['POST'])
def register():
    # ... (same as previous version)
    data = request.get_json()
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    conn = get_db_connection()
    try:
        conn.execute(
            'INSERT INTO Users (email, password_hash, display_name, major, year) VALUES (?, ?, ?, ?, ?)',
            (data['email'], password_hash, data['display_name'], data.get('major'), data.get('year'))
        )
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': 'User with this email already exists'}), 409
    finally:
        conn.close()
    return jsonify({'message': 'Registration successful.'}), 201


@app.route('/api/posts', methods=['POST'])
def create_post():
    """Creates a new post, calculating expiration time."""
    data = request.get_json()
    
    # The frontend will send the duration in hours
    duration_hours = int(data['duration_hours'])
    created_at = datetime.utcnow()
    expires_at = created_at + timedelta(hours=duration_hours)

    conn = get_db_connection()
    conn.execute(
        'INSERT INTO Posts (author_id, location, activity, people_needed, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
        (data['author_id'], data['location'], data['activity'], data['people_needed'], created_at.isoformat(), expires_at.isoformat())
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'Post created successfully'}), 201


@app.route('/api/posts/active', methods=['GET'])
def get_active_posts():
    """Fetches all posts that have not expired."""
    conn = get_db_connection()
    # This query is much simpler now!
    post_rows = conn.execute(
        "SELECT * FROM Posts WHERE is_active = 1 AND expires_at > ?", (datetime.utcnow().isoformat(),)
    ).fetchall()
    conn.close()

    # Convert database rows into a list of your Post objects
    posts_list = []
    for row in post_rows:
        created_at_obj = datetime.fromisoformat(row['created_at'])
        expires_at_obj = datetime.fromisoformat(row['expires_at'])
        duration_hours = (expires_at_obj - created_at_obj).total_seconds() / 3600
        
        post_obj = Post(
            id=row['id'],
            author_user=row['author_id'],
            location=row['location'],
            time_expiration_hours=duration_hours,
            group_current=row['people_joined'],
            group_size_max=row['people_needed'],
            course=row['activity'],
            time_creation_obj=created_at_obj,
            show_in_results=row['is_active']
        )
        
        # Use your custom methods for the JSON response
        posts_list.append({
            'id': post_obj.id,
            'location': post_obj.location,
            'activity': post_obj.course,
            'group_status': f"{post_obj.group_current}/{post_obj.group_size_max}",
            'time_posted': post_obj.get_time_creation(), # Your custom formatting!
            'hours_left': post_obj.get_time_expiration() # Your custom formatting!
        })

    return jsonify(posts_list)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)