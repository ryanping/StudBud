from flask import Flask
import os
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
    return "Hello, Flask!"

@app.route("/send-email")
def send_email():
    """Sends a test email using SendGrid."""
    try:
        # In a real app, the recipient would likely come from a form or database.
        # For SendGrid, the from_email must be a verified sender.
        recipient_email = 'pingfort@gmail.com'
        message = Mail(
            from_email=SENDER_EMAIL,
            to_emails=recipient_email,
            subject='Sending with Twilio SendGrid is Fun',
            html_content='<strong>and easy to do anywhere, even with Python</strong>')
        response = sg.send(message)
        app.logger.info(f"Email to {recipient_email} sent with status code: {response.status_code}")
        return f"Email sent! Status Code: {response.status_code}", 200
    except Exception as e:
        # Use str(e) to get the error message, not e.message
        app.logger.error(f"Error sending email: {str(e)}")
        return "Error sending email.", 500

if __name__ == "__main__":
    app.run(debug=True)