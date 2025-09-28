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
    # In a real app, you'd get userId from a secure JWT token, not the request body
    user_id = data.get('userId')
    
    conn = get_db_connection()
    conn.execute(
        'UPDATE Users SET display_name = ?, major = ?, year = ?, is_profile_complete = 1 WHERE id = ?',
        (data.get('display_name'), data.get('major'), data.get('year'), user_id)
    )
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Profile updated successfully.'}), 200


# --- POST & SEARCH API ROUTES ---

@app.route('/api/posts', methods=['POST'])
def create_post():
    """Creates a new post."""
    data = request.get_json()
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
    query = "SELECT * FROM Posts WHERE is_active = 1 AND expires_at > ?"
    params = [datetime.utcnow().isoformat()]

    # Handle filters
    if activity and activity.lower() != 'any':
        query += " AND activity = ?"
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
            WHEN activity = ? AND location IN ({location_placeholders}) THEN 1
            WHEN activity = ? THEN 2
            WHEN location IN ({location_placeholders}) THEN 3
            ELSE 4
        END
        """
        params.extend([activity] + locations + [activity] + locations)
    else: # priority == 'location'
        order_by_clause = f"""
        ORDER BY CASE
            WHEN activity = ? AND location IN ({location_placeholders}) THEN 1
            WHEN location IN ({location_placeholders}) THEN 2
            WHEN activity = ? THEN 3
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