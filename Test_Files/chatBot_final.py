import os
import dotenv
import logging
import tiktoken
import concurrent.futures
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pinecone import Pinecone
from langchain_groq import ChatGroq
from sentence_transformers import SentenceTransformer
from functions import web_search, VDB_search, final_output
from database import store_test_data, complete_retrival

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
dotenv.load_dotenv(".env")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_KEY_2 = os.getenv("GROQ_API_KEY_2")
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

if not PINECONE_API_KEY or not GROQ_API_KEY or not SERPER_API_KEY:
    logging.error("API keys are not set in the environment variables.")
    raise EnvironmentError("API keys are not set in the environment variables.")

model_name = "deepseek-r1-distill-llama-70b"
index_name = "medical-data"
# model_name = "llama-3.3-70b-versatile"
# model_name = "qwen-2.5-32b"

chat1 = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name=model_name
)
chat2 = ChatGroq(
    api_key=GROQ_API_KEY_2,
    model_name=model_name
)
tokenizer = tiktoken.get_encoding("cl100k_base")  # Adjust for your LLM

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(index_name)
embedding_model = SentenceTransformer("sentence-transformers/msmarco-bert-base-dot-v5")

app = FastAPI()

class ReportRequest(BaseModel):
    test_name: str
    report: str
    disease: str

@app.post("/")
def process_report(request: ReportRequest):
    try:
        flag = False
        logging.info(f"Received request: {request.json()}")
        test_name = request.test_name
        report = request.report
        disease = request.disease
        name_of_test, web_description = complete_retrival(test_name)
        if web_description is not None:
            web_search_content = web_description
            flag = True

        with concurrent.futures.ThreadPoolExecutor() as executor:
            if not flag:
                web_search_content = executor.submit(web_search, test_name, chat1, chat2, SERPER_API_KEY, tokenizer, max_tokens=4500)
            VDB_content = executor.submit(VDB_search, test_name, report, chat2, disease, embedding_model, index, top_k=5)
            
            try:
                web_results = web_search_content.result() if not flag else web_search_content
                vector_results, generated_text = VDB_content.result()
            except Exception as e:
                logging.error(f"An error occurred: {e}")
                raise HTTPException(status_code=500, detail="Internal Server Error")
            
            final_results = final_output(test_name, vector_results, report, web_results, disease, generated_text, chat1, chat2, normal_ranges=None)
            if not flag:
                store_test_data(test_name, web_results)
            return {"result": final_results}
    except Exception as e:
        logging.error(f"Error processing report: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
