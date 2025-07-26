# Medical Lab Bot

Medical Lab Bot is an AI-powered web application for interpreting medical lab reports from images. It leverages OCR, web search, and retrieval-augmented generation (RAG) to provide layman-friendly explanations and medical context.

## Features

- **Image Upload & OCR**: Upload lab report images (PNG/JPEG) for automated extraction of tabular data.
- **AI Interpretation**: Get concise, layman-understandable interpretations of your lab results.
- **Contextual Insights**: Integrates web-scraped and book-sourced medical knowledge for enhanced explanations.
- **Database Storage**: Stores and retrieves summarized web data for medical tests.
- **Extensible Scrappers**: Includes scrappers for medical websites and books.

## Directory Structure

- `API/`  
  - `app.py`: Flask web server for handling uploads and rendering results.  
  - `chatBot_final.py`: FastAPI endpoint for extracting lab report data from images.  
  - `functions.py`: Core logic for OCR, web search, context retrieval, and interpretation.  
  - `database.py`: Appwrite database integration for storing/retrieving medical data.  
  - `templates/`: HTML templates for the web interface.  
  - `uploads/`: Uploaded images.

- `Scrapper/`  
  - `scrapper.py`, `testingLab_scrapper.py`, `crawl4ai_Scrapper.ipynb`: Scripts for scraping medical test information from the web.

- `Test_Files/`  
  - Test scripts, notebooks, and sample data for development and validation.

## How It Works

1. **Upload**: User uploads a lab report image via the web interface.
2. **OCR Extraction**: The image is sent to the OCR API, which extracts tabular data as LaTeX.
3. **AI Interpretation**: The extracted data and test name are sent to the chatbot API for interpretation.
4. **Contextualization**: The system retrieves relevant medical context from web and book sources using embeddings and RAG.
5. **Result Display**: The interpretation and extracted table are rendered for the user.

## Getting Started

1. Clone the repository.
2. Install dependencies (see requirements in notebooks and scripts).
3. Set up environment variables in `.env`.
4. Start the Flask server (`API/app.py`) and FastAPI OCR/chatbot (`API/chatbot_final.py`) endpoints.
5. Access the web interface at `http://localhost:5000`.

## Technologies Used

- Python (Flask, FastAPI)
- LangChain, Sentence Transformers
- Appwrite (database)
- Pinecone (vector DB)
- Groq (LLM API)
- BeautifulSoup (scraping)
- Pydantic (data validation)

## Disclaimer

This tool provides informational interpretations only. Always consult a healthcare professional for medical advice.

---

© 2025 Medical Lab Bot.