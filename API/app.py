import os
import requests
import logging
import re
from flask import Flask, render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize Flask app
app = Flask(__name__)
app.secret_key = "medical_lab_bot_secret_key"

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
OCR_API_URL = "http://localhost:8001/extract-lab-report"
CHATBOT_API_URL = "http://localhost:8001/chat"

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def latex_to_html_table(latex_table):
    """Convert LaTeX table to HTML table."""
    # Extract rows from the LaTeX table
    rows = re.findall(r'\\hline\n(.*?)\\\\', latex_table, re.DOTALL)
    if not rows:
        return "<p>Invalid LaTeX table format</p>"

    # Build the HTML table
    html_table = '<table class="table table-bordered">'
    for i, row in enumerate(rows):
        html_table += '<tr>'
        cells = row.split('&')
        for cell in cells:
            cell_content = cell.strip()
            if i == 0:  # First row is the header
                html_table += f'<th>{cell_content}</th>'
            else:
                html_table += f'<td>{cell_content}</td>'
        html_table += '</tr>'
    html_table += '</table>'
    return html_table

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_report():
    """Process the uploaded image and form data"""
    # Check if required fields are provided
    if 'image' not in request.files:
        flash('No image file provided')
        return redirect(request.url)
    
    test_name = request.form.get('test_name', '')
    disease = request.form.get('disease', '')
    
    if not test_name:
        flash('Test name is required')
        return redirect(request.url)
    
    # Process the uploaded file
    file = request.files['image']
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
        
    if not file or not allowed_file(file.filename):
        flash('Invalid file type. Please upload a PNG or JPEG image.')
        return redirect(request.url)
    
    try:
        # Step 1: Send image to OCR API
        logging.info(f"Sending image to OCR API with test name: {test_name}")
        ocr_response = requests.post(
            OCR_API_URL,
            files={"file": (file.filename, file.stream, file.content_type)}
        )
        ocr_response.raise_for_status()
        extracted_text = ocr_response.text
        logging.info(f"OCR Extracted text: {extracted_text[:100]}...")
        logging.info(f"LaTeX Table Data: {extracted_text}")

        # Convert LaTeX table to HTML
        html_table = latex_to_html_table(extracted_text)

        # Step 2: Send extracted text to chatbot API
        chatbot_payload = {
            "test_name": test_name,
            "report": extracted_text,
            "disease": disease
        }
        logging.info(f"Sending data to Chatbot API: {chatbot_payload}")

        chatbot_response = requests.post(CHATBOT_API_URL, json=chatbot_payload)
        chatbot_response.raise_for_status()
        interpretation = chatbot_response.json().get("result", "No interpretation available")

        # Step 3: Display results
        return render_template(
            'result.html', 
            test_name=test_name, 
            disease=disease, 
            report_text=extracted_text,
            interpretation=interpretation,
            latex_table=html_table  # Pass the HTML table here
        )
        
    except requests.exceptions.RequestException as e:
        logging.error(f"API request error: {str(e)}")
        flash(f"Error processing request: {str(e)}")
        return redirect(url_for('index'))
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        flash(f"An unexpected error occurred: {str(e)}")
        return redirect(url_for('index'))

if __name__ == '__main__':
    # Start FastAPI servers first (you might want to use subprocess for production)
    # import subprocess
    # subprocess.Popen(["python", "OCR.py"])
    # subprocess.Popen(["python", "chatBot_final.py"])
    
    # Then start Flask app
    app.run(debug=True, port=5000)