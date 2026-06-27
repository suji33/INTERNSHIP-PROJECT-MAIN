# Python Backend Guide for ATS System

This guide provides complete Python backend code for the Applicant Tracking System. Run this locally and connect it to the React frontend.

---

## Project Structure

```
ats-backend/
├── app.py                    # Main Flask application
├── requirements.txt          # Python dependencies
├── utils/
│   ├── __init__.py
│   ├── text_extractor.py     # PDF/DOCX text extraction
│   ├── ats_scorer.py         # ATS scoring algorithm
│   └── chatbot.py            # Rule-based chatbot
└── uploads/                  # Temporary file storage (auto-created)
```

---

## Step 1: Create Project Folder

```bash
mkdir ats-backend
cd ats-backend
mkdir utils uploads
```

---

## Step 2: requirements.txt

Create this file to install dependencies:

```
Flask==2.3.3
flask-cors==4.0.0
PyPDF2==3.0.1
python-docx==0.8.11
werkzeug==2.3.7
```

Install with:
```bash
pip install -r requirements.txt
```

---

## Step 3: utils/__init__.py

```python
# Empty file to make utils a Python package
```

---

## Step 4: utils/text_extractor.py

```python
"""
Text Extractor Module
Extracts text from PDF and DOCX files

How it works:
1. Checks file extension to determine file type
2. For PDF: Uses PyPDF2 to read each page and extract text
3. For DOCX: Uses python-docx to read paragraphs
4. Returns combined text as a single string
"""

import PyPDF2
from docx import Document
import os


def extract_text_from_pdf(file_path):
    """
    Extract text from a PDF file
    
    Parameters:
        file_path (str): Path to the PDF file
    
    Returns:
        str: Extracted text from all pages
    """
    text = ""
    try:
        # Open PDF file in binary read mode
        with open(file_path, 'rb') as file:
            # Create PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Loop through each page
            for page in pdf_reader.pages:
                # Extract text from page and add to result
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                    
    except Exception as e:
        print(f"Error reading PDF: {e}")
        
    return text


def extract_text_from_docx(file_path):
    """
    Extract text from a DOCX file
    
    Parameters:
        file_path (str): Path to the DOCX file
    
    Returns:
        str: Extracted text from all paragraphs
    """
    text = ""
    try:
        # Open DOCX document
        doc = Document(file_path)
        
        # Loop through each paragraph
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
            
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        
    return text


def extract_text(file_path):
    """
    Main function to extract text from any supported file
    
    Parameters:
        file_path (str): Path to the file (PDF or DOCX)
    
    Returns:
        str: Extracted text
    
    Raises:
        ValueError: If file format is not supported
    """
    # Get file extension
    _, extension = os.path.splitext(file_path)
    extension = extension.lower()
    
    # Choose appropriate extractor based on extension
    if extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif extension == '.docx':
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file format: {extension}")
```

---

## Step 5: utils/ats_scorer.py

```python
"""
ATS Scoring Module
Calculates match score between resume and job description

Algorithm Explanation:
1. Extract keywords from job description
2. Compare with resume text
3. Calculate percentage match
4. Threshold: 70% = Shortlisted, below = Rejected
"""

import re
from collections import Counter


# Common skills to look for (expandable list)
SKILL_KEYWORDS = [
    # Programming Languages
    'python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'swift',
    'kotlin', 'typescript', 'go', 'rust', 'scala', 'r',
    
    # Web Technologies
    'html', 'css', 'react', 'angular', 'vue', 'node', 'express', 'django',
    'flask', 'spring', 'asp.net', 'jquery', 'bootstrap', 'tailwind',
    
    # Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'redis', 'elasticsearch',
    
    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd',
    'terraform', 'ansible',
    
    # Data Science
    'machine learning', 'deep learning', 'data analysis', 'pandas', 'numpy',
    'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'computer vision',
    
    # Tools
    'git', 'github', 'jira', 'agile', 'scrum', 'rest api', 'graphql',
    
    # Soft Skills
    'communication', 'teamwork', 'leadership', 'problem solving',
    'analytical', 'project management', 'time management'
]


def clean_text(text):
    """
    Clean and normalize text for comparison
    
    Parameters:
        text (str): Raw text
    
    Returns:
        str: Cleaned lowercase text
    """
    # Convert to lowercase
    text = text.lower()
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text


def extract_skills(text):
    """
    Extract skills from text based on predefined keyword list
    
    Parameters:
        text (str): Text to analyze
    
    Returns:
        set: Set of found skills
    """
    cleaned = clean_text(text)
    found_skills = set()
    
    for skill in SKILL_KEYWORDS:
        # Check if skill exists in text
        if skill in cleaned:
            found_skills.add(skill)
    
    return found_skills


def calculate_ats_score(resume_text, job_description):
    """
    Calculate ATS score by comparing resume with job description
    
    Parameters:
        resume_text (str): Text extracted from resume
        job_description (str): Job description text
    
    Returns:
        dict: Contains score, matched skills, missing skills, and status
    
    Scoring Logic:
    - Extract skills from both texts
    - Calculate: (matched / required) * 100
    - If no skills found in job description, return 50%
    """
    # Extract skills from both texts
    job_skills = extract_skills(job_description)
    resume_skills = extract_skills(resume_text)
    
    # Find matched and missing skills
    matched_skills = job_skills.intersection(resume_skills)
    missing_skills = job_skills.difference(resume_skills)
    
    # Calculate score
    if len(job_skills) == 0:
        # No specific skills mentioned in job description
        score = 50
    else:
        score = round((len(matched_skills) / len(job_skills)) * 100)
    
    # Determine status based on threshold
    status = "Shortlisted" if score >= 70 else "Rejected"
    
    return {
        'score': score,
        'status': status,
        'matched_skills': list(matched_skills),
        'missing_skills': list(missing_skills),
        'total_job_skills': len(job_skills),
        'total_resume_skills': len(resume_skills)
    }
```

---

## Step 6: utils/chatbot.py

```python
"""
Rule-Based Chatbot Module
Provides resume improvement suggestions based on analysis

Logic:
1. Analyzes missing skills
2. Groups skills by category
3. Returns targeted suggestions
"""


def get_skill_category(skill):
    """
    Categorize a skill for better suggestions
    
    Parameters:
        skill (str): Skill name
    
    Returns:
        str: Category name
    """
    programming = ['python', 'java', 'javascript', 'c++', 'typescript', 'go']
    web = ['html', 'css', 'react', 'angular', 'vue', 'node', 'django', 'flask']
    database = ['sql', 'mysql', 'postgresql', 'mongodb', 'redis']
    cloud = ['aws', 'azure', 'gcp', 'docker', 'kubernetes']
    data = ['machine learning', 'data analysis', 'pandas', 'tensorflow']
    soft = ['communication', 'teamwork', 'leadership', 'problem solving']
    
    skill_lower = skill.lower()
    
    if skill_lower in programming:
        return 'Programming Languages'
    elif skill_lower in web:
        return 'Web Development'
    elif skill_lower in database:
        return 'Database Technologies'
    elif skill_lower in cloud:
        return 'Cloud & DevOps'
    elif skill_lower in data:
        return 'Data Science'
    elif skill_lower in soft:
        return 'Soft Skills'
    else:
        return 'Technical Skills'


def generate_suggestion(missing_skills, matched_skills, score):
    """
    Generate personalized resume improvement suggestions
    
    Parameters:
        missing_skills (list): Skills not found in resume
        matched_skills (list): Skills found in both
        score (int): ATS score percentage
    
    Returns:
        str: Detailed suggestion text
    """
    suggestions = []
    
    # Opening based on score
    if score >= 70:
        suggestions.append(
            f"Congratulations! Your score of {score}% means you're likely to be shortlisted. "
            "Here are some tips to make your resume even stronger:"
        )
    else:
        suggestions.append(
            f"Your current score is {score}%, which is below the 70% threshold. "
            "Don't worry - here's how you can improve:"
        )
    
    # Missing skills suggestions
    if missing_skills:
        suggestions.append("\n\n📚 SKILLS TO ADD:")
        
        # Group by category
        categories = {}
        for skill in missing_skills:
            cat = get_skill_category(skill)
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(skill)
        
        for category, skills in categories.items():
            skills_text = ', '.join(skills)
            suggestions.append(f"\n• {category}: {skills_text}")
            
            # Add specific advice for each category
            if category == 'Programming Languages':
                suggestions.append(
                    "  → Add projects or coursework demonstrating these languages"
                )
            elif category == 'Soft Skills':
                suggestions.append(
                    "  → Include examples of these skills in your experience section"
                )
    
    # Section improvement tips
    suggestions.append("\n\n📝 SECTIONS TO IMPROVE:")
    
    if score < 70:
        suggestions.append(
            "\n• Summary: Tailor it to match the job description keywords"
        )
        suggestions.append(
            "\n• Skills Section: Add a dedicated skills section with bullet points"
        )
    
    suggestions.append(
        "\n• Experience: Use action verbs and quantify achievements"
    )
    suggestions.append(
        "\n• Format: Ensure clean formatting without tables or graphics"
    )
    
    # General tips
    suggestions.append("\n\n💡 GENERAL TIPS:")
    suggestions.append("\n• Use keywords exactly as they appear in the job posting")
    suggestions.append("\n• Keep your resume to 1-2 pages maximum")
    suggestions.append("\n• Save as PDF to preserve formatting")
    
    if matched_skills:
        skills_text = ', '.join(matched_skills[:5])
        suggestions.append(
            f"\n\n✅ Your strong points: {skills_text}"
        )
    
    return ''.join(suggestions)


def get_chatbot_response(query, missing_skills, matched_skills, score):
    """
    Process user query and return appropriate response
    
    Parameters:
        query (str): User's question
        missing_skills (list): Missing skills from analysis
        matched_skills (list): Matched skills from analysis
        score (int): ATS score
    
    Returns:
        str: Chatbot response
    """
    query_lower = query.lower()
    
    # Check for specific intents
    if 'improve' in query_lower or 'better' in query_lower or 'help' in query_lower:
        return generate_suggestion(missing_skills, matched_skills, score)
    
    elif 'skill' in query_lower or 'add' in query_lower:
        if not missing_skills:
            return (
                "Great news! Your resume already contains all the key skills "
                "from the job description. To stand out further, consider:\n\n"
                "• Adding relevant certifications\n"
                "• Including more project examples\n"
                "• Quantifying your achievements with numbers"
            )
        skills_list = '\n'.join([f"• {skill}" for skill in missing_skills])
        return f"Here are the skills you should add:\n\n{skills_list}"
    
    elif 'score' in query_lower or 'percent' in query_lower:
        status = "above" if score >= 70 else "below"
        return (
            f"Your ATS score is {score}%, which is {status} the 70% threshold.\n\n"
            f"Matched skills: {len(matched_skills)}\n"
            f"Missing skills: {len(missing_skills)}\n\n"
            "The score is calculated by comparing skills in your resume "
            "with those required in the job description."
        )
    
    elif 'format' in query_lower or 'section' in query_lower:
        return (
            "Resume formatting tips:\n\n"
            "1. SECTIONS (in order):\n"
            "   • Contact Information\n"
            "   • Professional Summary\n"
            "   • Skills\n"
            "   • Work Experience\n"
            "   • Education\n"
            "   • Projects (optional)\n\n"
            "2. FORMATTING:\n"
            "   • Use standard fonts (Arial, Calibri)\n"
            "   • 10-12pt font size\n"
            "   • Clear section headings\n"
            "   • Consistent bullet points\n"
            "   • No tables or graphics\n"
            "   • Save as PDF"
        )
    
    else:
        # Default response
        return (
            "I can help you with:\n\n"
            "• 'How to improve my resume?' - Get personalized suggestions\n"
            "• 'What skills should I add?' - See missing skills\n"
            "• 'Explain my score' - Understand the ATS score\n"
            "• 'Format tips' - Resume formatting advice\n\n"
            f"Your current score: {score}% | "
            f"Matched: {len(matched_skills)} | "
            f"Missing: {len(missing_skills)}"
        )
```

---

## Step 7: app.py (Main Application)

```python
"""
ATS Backend - Main Flask Application

API Endpoints:
1. POST /api/analyze - Analyze resume against job description
2. POST /api/chat - Get chatbot suggestions
3. GET /api/health - Check if server is running

Run with: python app.py
Server starts at: http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os

# Import utility modules
from utils.text_extractor import extract_text
from utils.ats_scorer import calculate_ats_score
from utils.chatbot import get_chatbot_response

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for React frontend
CORS(app, origins=['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'])

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    Used by frontend to verify backend is running
    
    Returns:
        JSON: {"status": "ok", "message": "ATS Backend is running"}
    """
    return jsonify({
        'status': 'ok',
        'message': 'ATS Backend is running'
    })


@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    """
    Analyze resume against job description
    
    Request:
        - resume: File (PDF or DOCX)
        - job_description: String
    
    Response:
        - score: Integer (0-100)
        - status: String ("Shortlisted" or "Rejected")
        - matched_skills: List of strings
        - missing_skills: List of strings
    """
    try:
        # Check if resume file is present
        if 'resume' not in request.files:
            return jsonify({
                'error': 'No resume file provided'
            }), 400
        
        # Check if job description is present
        job_description = request.form.get('job_description', '')
        if not job_description or len(job_description) < 50:
            return jsonify({
                'error': 'Job description must be at least 50 characters'
            }), 400
        
        # Get the file
        file = request.files['resume']
        
        # Validate file
        if file.filename == '':
            return jsonify({
                'error': 'No file selected'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Invalid file type. Only PDF and DOCX allowed'
            }), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            # Extract text from resume
            resume_text = extract_text(filepath)
            
            if not resume_text or len(resume_text) < 50:
                return jsonify({
                    'error': 'Could not extract text from resume'
                }), 400
            
            # Calculate ATS score
            result = calculate_ats_score(resume_text, job_description)
            
            # Return results
            return jsonify({
                'score': result['score'],
                'status': result['status'],
                'matched_skills': result['matched_skills'],
                'missing_skills': result['missing_skills']
            })
            
        finally:
            # Clean up - delete uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
                
    except Exception as e:
        print(f"Error in analyze: {e}")
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Get chatbot suggestions for resume improvement
    
    Request (JSON):
        - missing_skills: List of strings
        - matched_skills: List of strings
        - score: Integer
        - query: String (optional, defaults to general help)
    
    Response:
        - suggestion: String with improvement tips
    """
    try:
        data = request.get_json()
        
        missing_skills = data.get('missing_skills', [])
        matched_skills = data.get('matched_skills', [])
        score = data.get('score', 0)
        query = data.get('query', 'help me improve')
        
        # Generate response
        suggestion = get_chatbot_response(
            query, missing_skills, matched_skills, score
        )
        
        return jsonify({
            'suggestion': suggestion
        })
        
    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("=" * 50)
    print("ATS Backend Server")
    print("=" * 50)
    print("Starting server at http://localhost:5000")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    # Run the server
    app.run(host='0.0.0.0', port=5000, debug=True)
```

---

## Running the Backend

1. Open terminal in `ats-backend` folder
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python app.py
   ```
4. Server runs at `http://localhost:5000`

---

## Sample API Requests

### 1. Analyze Resume

**Endpoint:** `POST /api/analyze`

**Request (using curl):**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "resume=@sample_resume.pdf" \
  -F "job_description=We need a Python developer with experience in Django, REST APIs, SQL databases, and machine learning. Must have good communication skills."
```

**Response:**
```json
{
  "score": 75,
  "status": "Shortlisted",
  "matched_skills": ["python", "django", "sql", "machine learning"],
  "missing_skills": ["rest api", "communication"]
}
```

### 2. Get Chat Suggestions

**Endpoint:** `POST /api/chat`

**Request:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "missing_skills": ["rest api", "communication"],
    "matched_skills": ["python", "django", "sql"],
    "score": 75,
    "query": "How can I improve my resume?"
  }'
```

**Response:**
```json
{
  "suggestion": "Congratulations! Your score of 75% means you're likely to be shortlisted..."
}
```

### 3. Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "message": "ATS Backend is running"
}
```

---

## Connecting Frontend to Backend

The React frontend is pre-configured to connect to `http://localhost:5000/api`.

If you need to change the backend URL, edit:
`src/services/atsApi.ts` → Change `BASE_URL`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Make sure Flask-CORS is installed and frontend URL is in allowed origins |
| File upload fails | Check file is PDF or DOCX and under 5MB |
| Empty text extraction | Some PDFs are image-based; try a different PDF |
| Module not found | Run `pip install -r requirements.txt` again |

---

## Next: Viva Preparation

See `VIVA_PREPARATION.md` for:
- Common viva questions and answers
- System architecture explanation
- Algorithm walkthrough
- Future enhancement ideas
