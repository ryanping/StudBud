import os
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)

# Best Practice: Initialize clients and config once when the app starts.
sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'rodgerssky01@gmail.com')

@app.route("/")
def home():
    # It's better to return JSON, even for simple endpoints.
    return jsonify({"message": "Welcome to the StudBud API!"})

@app.route("/send-verif", methods=['POST'])
def send_email():
    """
    Sends a verification email using SendGrid.
    Expects a JSON body with an 'email' key.
    e.g., { "email": "user@example.com" }
    """
    # Get the recipient email from the incoming JSON request body
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({"error": "Missing 'email' in request body"}), 400

    recipient_email = data['email']

    try:
        message = Mail(
            from_email=SENDER_EMAIL,
            to_emails=recipient_email,
            subject='Sending with Twilio SendGrid is Fun',
            html_content='<strong>and easy to do anywhere, even with Python</strong>')

        response = sg.send(message)
        app.logger.info(f"Email to {recipient_email} sent with status code: {response.status_code}")
        return jsonify({"message": f"Email successfully sent to {recipient_email}"}), 200

    except Exception as e:
        app.logger.error(f"Error sending email: {str(e)}")
        # Provide a more structured error response
        return jsonify({"error": "An error occurred while sending the email."}), 500

if __name__ == "__main__":
    app.run(debug=True)