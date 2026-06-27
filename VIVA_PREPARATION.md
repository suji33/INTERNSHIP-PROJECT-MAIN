# ATS System - Viva Preparation Guide

Complete preparation material for your college project viva examination.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│                     (React Frontend)                            │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐    │
│  │   Resume    │  │ Job Description │  │  Results Panel   │    │
│  │   Upload    │  │     Input       │  │  + Chatbot       │    │
│  └─────────────┘  └─────────────────┘  └──────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PYTHON BACKEND                              │
│                       (Flask API)                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    app.py (Routes)                       │    │
│  │  /api/analyze  │  /api/chat  │  /api/health             │    │
│  └────────┬───────────────┬─────────────────────────────────┘    │
│           ▼               ▼                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐      │
│  │    Text     │  │    ATS      │  │     Chatbot         │      │
│  │  Extractor  │  │   Scorer    │  │     Engine          │      │
│  │ (PyPDF2/    │  │ (Keyword    │  │  (Rule-Based)       │      │
│  │  python-    │  │  Matching)  │  │                     │      │
│  │  docx)      │  │             │  │                     │      │
│  └─────────────┘  └─────────────┘  └─────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Viva Questions and Answers

### 1. Basic Understanding

**Q1: What is an Applicant Tracking System (ATS)?**

An ATS is software used by companies to manage job applications. It:
- Scans resumes automatically
- Extracts key information (skills, experience, education)
- Compares against job requirements
- Ranks candidates based on match percentage
- Filters out unsuitable candidates before human review

Our system simulates this process to help candidates optimize their resumes.

---

**Q2: Why is ATS important for job seekers?**

- 75% of resumes are rejected by ATS before reaching human recruiters
- Many qualified candidates get filtered out due to poor formatting
- Understanding ATS helps candidates:
  - Use the right keywords
  - Format resumes correctly
  - Increase chances of getting interviews

---

**Q3: What technologies did you use and why?**

| Component | Technology | Reason |
|-----------|------------|--------|
| Frontend | React | Component-based, fast rendering, industry standard |
| Backend | Python/Flask | Simple syntax, excellent libraries for text processing |
| PDF Parsing | PyPDF2 | Lightweight, reliable PDF text extraction |
| DOCX Parsing | python-docx | Native support for Word documents |
| API | REST | Simple, stateless, easy to understand |

---

### 2. Algorithm Explanation

**Q4: Explain the ATS scoring algorithm.**

```
Step 1: Extract text from resume (PDF/DOCX → plain text)
        ↓
Step 2: Clean and normalize text (lowercase, remove special chars)
        ↓
Step 3: Extract skills from job description using keyword matching
        ↓
Step 4: Extract skills from resume using same keywords
        ↓
Step 5: Compare skill sets:
        - Matched Skills = Skills in BOTH resume AND job description
        - Missing Skills = Skills in job description BUT NOT in resume
        ↓
Step 6: Calculate Score = (Matched Skills / Total Required Skills) × 100
        ↓
Step 7: Apply Threshold:
        - Score ≥ 70% → "Shortlisted"
        - Score < 70% → "Rejected"
```

**Formula:**
```
ATS Score = (Number of Matched Skills / Number of Required Skills) × 100
```

**Example:**
- Job requires: Python, React, SQL, Machine Learning (4 skills)
- Resume has: Python, React, Git (3 skills, but only 2 match)
- Matched: Python, React (2)
- Missing: SQL, Machine Learning (2)
- Score: (2/4) × 100 = 50% → Rejected

---

**Q5: Why did you choose 70% as the threshold?**

- Industry research shows 70-75% is common ATS threshold
- Allows room for candidates who may have related/transferable skills
- Not too strict (would reject most candidates)
- Not too lenient (would pass unqualified candidates)
- Can be adjusted based on company requirements

---

**Q6: How does text extraction work?**

**For PDF files (PyPDF2):**
```python
# Open PDF in binary mode
pdf_reader = PyPDF2.PdfReader(file)

# Loop through each page
for page in pdf_reader.pages:
    text += page.extract_text()
```

**For DOCX files (python-docx):**
```python
# Open document
doc = Document(file_path)

# Extract paragraphs
for paragraph in doc.paragraphs:
    text += paragraph.text
```

---

### 3. Chatbot Logic

**Q7: How does the rule-based chatbot work?**

The chatbot uses if-else logic to match user queries:

```
User Query → Keyword Detection → Category Match → Generate Response

Categories:
1. "improve", "better", "help" → Improvement suggestions
2. "skill", "add" → Missing skills list
3. "score", "percent" → Score explanation
4. "format", "section" → Formatting tips
5. Default → Menu of options
```

**Decision Tree:**
```
                    User Query
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    "improve"       "skills"        "format"
        │               │               │
        ▼               ▼               ▼
   Generate       List Missing      Format
   Full Tips        Skills          Tips
```

---

**Q8: Why rule-based instead of AI/ML chatbot?**

| Aspect | Rule-Based | AI/ML Based |
|--------|------------|-------------|
| Complexity | Simple if-else | Requires training data |
| Explainability | Easy to explain in viva | Black box behavior |
| Resources | No external dependencies | Needs API keys or models |
| Reliability | Predictable responses | May give incorrect info |
| Project Scope | Suitable for college level | More advanced |

---

### 4. Technical Details

**Q9: Explain REST API communication.**

REST (Representational State Transfer) uses HTTP methods:

```
Frontend (React)                    Backend (Flask)
      │                                   │
      │──── POST /api/analyze ───────────→│
      │     (resume + job description)    │
      │                                   │
      │←─── JSON Response ────────────────│
      │     {score, skills, status}       │
```

**Key REST Principles:**
- Stateless: Each request contains all needed information
- Client-Server: Frontend and backend are separate
- Uniform Interface: Standard HTTP methods (GET, POST)

---

**Q10: How do you handle file uploads?**

1. Frontend sends file using `FormData` object
2. Backend receives with `request.files`
3. File is temporarily saved to disk
4. Text is extracted
5. File is deleted after processing

```python
# Save temporarily
filepath = os.path.join(UPLOAD_FOLDER, filename)
file.save(filepath)

# Process
resume_text = extract_text(filepath)

# Clean up
os.remove(filepath)
```

---

**Q11: What is CORS and why is it needed?**

CORS (Cross-Origin Resource Sharing):
- Browser security feature
- Prevents website A from accessing website B's APIs
- Frontend runs on port 5173, backend on port 5000
- Different ports = different origins = blocked by default
- Flask-CORS allows our frontend to access backend

```python
CORS(app, origins=['http://localhost:5173'])
```

---

### 5. Limitations and Future Scope

**Q12: What are the limitations of your system?**

1. **Keyword-Only Matching**
   - Doesn't understand synonyms (e.g., "JS" vs "JavaScript")
   - Cannot detect related skills

2. **Static Skill List**
   - Skills must be predefined
   - Doesn't adapt to new technologies

3. **Text-Based Only**
   - Cannot process image-based PDFs (scanned documents)
   - No OCR capability

4. **No Context Understanding**
   - Treats "5 years of Python" same as "learning Python"
   - Cannot evaluate experience level

5. **Single Resume Analysis**
   - No bulk processing
   - No comparison between multiple resumes

---

**Q13: What future enhancements could be added?**

| Enhancement | Description | Difficulty |
|-------------|-------------|------------|
| Synonym Detection | Match "JS" with "JavaScript" | Medium |
| OCR Integration | Process scanned documents | Medium |
| Experience Weighting | Give more points for senior experience | Low |
| Multiple Resume Comparison | Rank multiple candidates | Medium |
| Resume Builder | Generate ATS-friendly resumes | High |
| Job Recommendation | Suggest jobs based on skills | High |
| Machine Learning Scoring | Train model on real hiring data | High |
| Browser Extension | Analyze resumes on job sites | Medium |

---

### 6. Project-Specific Questions

**Q14: How did you test your system?**

1. **Unit Testing**: Tested individual functions
   - Text extraction with sample PDFs/DOCXs
   - Score calculation with known inputs/outputs
   - Chatbot responses for each category

2. **Integration Testing**: Tested API endpoints
   - Using Postman/curl for API calls
   - Verified JSON responses

3. **User Testing**: Tested full flow
   - Uploaded real resumes
   - Compared scores with expectations

---

**Q15: What challenges did you face?**

| Challenge | Solution |
|-----------|----------|
| PDF text extraction inconsistencies | Used fallback methods, cleaned text |
| CORS errors during development | Added Flask-CORS with correct origins |
| File cleanup after processing | Used try-finally block |
| Skill keyword coverage | Created comprehensive skill list |
| Chatbot response relevance | Refined keyword matching logic |

---

**Q16: How would you scale this system?**

1. **Database**: Add PostgreSQL for storing results
2. **Authentication**: Add user login for history
3. **Caching**: Cache frequently analyzed job descriptions
4. **Queue System**: Use Celery for async processing
5. **Containerization**: Docker for easy deployment
6. **Load Balancing**: Multiple Flask instances

---

## Code Walkthrough Scripts

### Script 1: Explaining Text Extraction

"When a user uploads a resume, the system first needs to extract text from the file. For PDF files, we use PyPDF2 library which reads the file in binary mode and iterates through each page to extract text. For DOCX files, we use python-docx which parses the document structure and extracts text from each paragraph. This extracted text is then passed to our scoring module."

### Script 2: Explaining ATS Scoring

"The scoring algorithm works by first defining a list of common skills and keywords. We then check how many of these skills appear in both the job description and the resume. The score is calculated as the percentage of job-required skills found in the resume. If this percentage is 70 or above, the candidate is marked as shortlisted; otherwise, they are rejected."

### Script 3: Explaining the Chatbot

"Our chatbot uses a rule-based approach for simplicity and explainability. When a user asks a question, we check for specific keywords in their query. Based on these keywords, we categorize the question and generate an appropriate response. For example, if the user asks about 'skills', we show them the missing skills from their analysis."

---

## Quick Reference Card

| Term | Definition |
|------|------------|
| ATS | Software that scans and ranks job applications |
| REST API | Web service that uses HTTP methods |
| CORS | Browser security for cross-origin requests |
| Flask | Python web framework |
| React | JavaScript library for building UIs |
| FormData | JavaScript object for file uploads |
| JSON | Data format for API communication |
| PyPDF2 | Python library for PDF text extraction |
| python-docx | Python library for DOCX parsing |

---

## Demonstration Checklist

Before viva, ensure:
- [ ] Backend server starts without errors
- [ ] Frontend loads correctly
- [ ] Sample PDF/DOCX files ready for testing
- [ ] Sample job description prepared
- [ ] Know scores for test files (to verify correctness)
- [ ] Chatbot responds to all query types
- [ ] Can explain each component's code

---

*Good luck with your viva!*
