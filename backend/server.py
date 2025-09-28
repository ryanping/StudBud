# backend/server.py

import os
import sqlite3
import random
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Import your custom classes
from proto_backend import User, Post

# --- APP CONFIGURATION ---
load_dotenv()
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
# IMPORTANT: Make sure this email is verified in your SendGrid account
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'your-verified-email@example.com')

# --- DATABASE HELPER ---
def get_db_connection():
    """Establishes a connection to the SQLite database."""
    conn = sqlite3.connect('database/studbud.db')
    conn.row_factory = sqlite3.Row
    return conn

# --- AUTHENTICATION & PROFILE API ROUTES ---

# in backend/server.py

@app.route('/api/auth/send-code', methods=['POST'])
def send_verification_code():
    """Generates a code, saves it to the user, and emails it."""
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    code = str(random.randint(100000, 999999))
    expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()

    # --- REVISED DATABASE LOGIC ---
    # 1. First, try to UPDATE an existing user.
    cursor.execute(
        'UPDATE Users SET verification_code = ?, verification_code_expires_at = ? WHERE email = ?',
        (code, expires_at, email)
    )

    # 2. If no rows were updated (meaning the user is new), then INSERT them.
    if cursor.rowcount == 0:
        cursor.execute(
            'INSERT INTO Users (email, verification_code, verification_code_expires_at) VALUES (?, ?, ?)',
            (email, code, expires_at)
        )
    # -----------------------------
    
    conn.commit()
    conn.close()

    # Send email using SendGrid (this part stays the same)
    message = Mail(
        from_email=SENDER_EMAIL, to_emails=email,
        subject='Your StudBud Verification Code',
        html_content=f'<strong>Your verification code is: {code}</strong>'
    )
    try:
        sg.send(message)
        return jsonify({'message': 'Verification code sent.'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to send email: {e}'}), 500


@app.route('/api/auth/verify-code', methods=['POST'])
def verify_code():
    """Verifies a code and checks if the user's profile is complete."""
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    conn = get_db_connection()
    user_row = conn.execute('SELECT * FROM Users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if not user_row or user_row['verification_code'] != code:
        return jsonify({'error': 'Invalid code'}), 400
    if datetime.utcnow() > datetime.fromisoformat(user_row['verification_code_expires_at']):
        return jsonify({'error': 'Code has expired'}), 400
    
    # In a real app, you would generate a JWT token here for the user to stay logged in
    return jsonify({
        'message': 'Verification successful!',
        'userId': user_row['id'],
        'isProfileComplete': bool(user_row['is_profile_complete'])
    }), 200


@app.route('/api/profile', methods=['POST'])
def create_or_update_profile():
    """Creates or updates a user's profile information."""
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required to update a profile.'}), 400
    
    conn = get_db_connection()
    conn.execute(
        'UPDATE Users SET display_name = ?, major = ?, year = ?, is_profile_complete = 1 WHERE email = ?',
        (data.get('display_name'), data.get('major'), data.get('year'), email)
    )
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Profile updated successfully.'}), 200


@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Fetches a user's profile data by email."""
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email query parameter is required'}), 400

    conn = get_db_connection()
    user = conn.execute(
        'SELECT id, display_name, email, year, major FROM Users WHERE email = ?',
        (email,)
    ).fetchone()
    conn.close()

    if user is None:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(dict(user))

# --- POST & SEARCH API ROUTES ---

@app.route('/api/posts', methods=['GET'])
def get_active_posts():
    """Fetches all active, non-expired posts with author information."""
    conn = get_db_connection()
    
    # --- Cleanup Expired Posts ---
    # Before fetching, we can perform a cleanup of posts that have expired.
    # This keeps the database clean.
    now_iso = datetime.utcnow().isoformat()
    conn.execute('DELETE FROM Posts WHERE expires_at <= ?', (now_iso,))
    conn.commit()
    
    query = """
        SELECT
            p.id,
            p.author_id,
            u.display_name as author_name,
            p.location,
            p.activity,
            p.people_needed,
            p.people_joined,
            p.created_at,
            p.expires_at
        FROM Posts p
        JOIN Users u ON p.author_id = u.id
        WHERE p.is_active = 1 -- We already deleted expired posts, so no need to check expires_at here.
        ORDER BY p.created_at DESC
    """
    posts = conn.execute(query).fetchall()
    conn.close()

    return jsonify([dict(post) for post in posts])

@app.route('/api/posts', methods=['POST'])
def create_post():
    """Creates a new post."""
    data = request.get_json()

    # --- Data Validation ---
    required_fields = ['author_id', 'activity', 'location', 'people_needed', 'duration_hours']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields for post creation.'}), 400

    try:
        author_id = int(data['author_id'])
        people_needed = int(data['people_needed'])
        duration_hours = int(data['duration_hours'])
    except (ValueError, TypeError):
        return jsonify({'error': 'author_id, people_needed, and duration_hours must be integers.'}), 400
    
    # --- Calculate Timestamps ---
    created_at = datetime.utcnow()
    expires_at = created_at + timedelta(hours=duration_hours)

    # --- Database Insertion ---
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO Posts (author_id, location, activity, people_needed, people_joined, is_active, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (author_id, data['location'], data['activity'], people_needed, 0, 1, created_at.isoformat(), expires_at.isoformat())
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'Post created successfully'}), 201


@app.route('/api/posts/<int:post_id>', methods=['PATCH'])
def update_post(post_id):
    """Updates specific fields of a post. Requires author authorization."""
    data = request.get_json()
    # For now, we get user_id from the body for testing.
    # In a real app, this would come from a secure session token.
    requesting_user_id = data.get('user_id')
    if not requesting_user_id:
        return jsonify({'error': 'Authentication is required.'}), 401

    conn = get_db_connection()
    # First, verify the user owns the post
    post = conn.execute('SELECT author_id FROM Posts WHERE id = ?', (post_id,)).fetchone()

    if not post:
        conn.close()
        return jsonify({'error': 'Post not found.'}), 404

    if post['author_id'] != requesting_user_id:
        conn.close()
        return jsonify({'error': 'You are not authorized to edit this post.'}), 403

    # Dynamically build the SET part of the UPDATE query
    update_fields = []
    params = []
    
    # List of fields a user is allowed to update
    allowed_fields = ['location', 'activity', 'people_needed', 'people_joined', 'is_active']

    for field in allowed_fields:
        if field in data:
            update_fields.append(f"{field} = ?")
            params.append(data[field])

    # Special case: updating duration recalculates expires_at
    if 'duration_hours' in data:
        duration_hours = int(data['duration_hours'])
        new_expires_at = datetime.utcnow() + timedelta(hours=duration_hours)
        update_fields.append("expires_at = ?")
        params.append(new_expires_at.isoformat())

    if not update_fields:
        conn.close()
        return jsonify({'error': 'No updateable fields provided.'}), 400

    # Construct and execute the final query
    query = f"UPDATE Posts SET {', '.join(update_fields)} WHERE id = ?"
    params.append(post_id)
    
    conn.execute(query, tuple(params))
    conn.commit()
    conn.close()

    return jsonify({'message': f'Post {post_id} updated successfully.'}), 200

@app.route('/api/posts/search', methods=['POST'])
def search_posts_advanced():
    """
    Searches for posts with multiple locations and user-defined priority.
    This is your ranked search function, converted into an API route.
    """
    data = request.get_json()
    locations = data.get('locations', [])
    activity = data.get('activity', 'any')
    priority = data.get('priority', 'activity')

    # Security Check: Whitelist the priority input
    if priority not in ['location', 'activity']:
        return jsonify({'error': "Priority must be 'location' or 'activity'."}), 400

    # Build the dynamic SQL query
    query = """
        SELECT
            p.id, p.author_id, u.display_name as author_name, p.location,
            p.activity, p.people_needed, p.people_joined, p.created_at, p.expires_at
        FROM Posts p
        JOIN Users u ON p.author_id = u.id
        WHERE p.is_active = 1 AND p.expires_at > ?
    """
    params = [datetime.utcnow().isoformat()]

    # Handle filters
    if activity and activity.lower() != 'any':
        query += " AND p.activity = ?"
        params.append(activity)

    if locations and 'any' not in [loc.lower() for loc in locations]:
        placeholders = ','.join(['?'] * len(locations))
        query += f" AND location IN ({placeholders})"
        params.extend(locations)

    # Handle dynamic priority sorting
    location_placeholders = ','.join(['?'] * len(locations)) if locations else "''"
    
    order_by_clause = ""
    if priority == 'activity':
        order_by_clause = f"""
        ORDER BY CASE
            WHEN p.activity = ? AND p.location IN ({location_placeholders}) THEN 1
            WHEN p.activity = ? THEN 2
            WHEN p.location IN ({location_placeholders}) THEN 3
            ELSE 4
        END
        """
        params.extend([activity] + locations + [activity] + locations)
    else: # priority == 'location'
        order_by_clause = f"""
        ORDER BY CASE
            WHEN p.activity = ? AND p.location IN ({location_placeholders}) THEN 1
            WHEN p.location IN ({location_placeholders}) THEN 2
            WHEN p.activity = ? THEN 3
            ELSE 4
        END
        """
        params.extend([activity] + locations + locations + [activity])
    
    query += order_by_clause

    # Execute the final query
    conn = get_db_connection()
    post_rows = conn.execute(query, params).fetchall()
    conn.close()
    
    results = [dict(row) for row in post_rows]
    return jsonify(results)

# --- MAIN EXECUTION ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)