import time
script_start = time.time()
import os
import dotenv
import tiktoken
import concurrent.futures
from pinecone import Pinecone

from langchain_groq import ChatGroq
from sentence_transformers import SentenceTransformer
from functions import web_search, VDB_search, final_output

dotenv.load_dotenv(".env")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SERPER_API_KEY = os.getenv("SERPER_API_KEY")


model_name = "deepseek-r1-distill-llama-70b"
index_name = "medical-data"
# model_name = "llama-3.3-70b-versatile"
# model_name = "qwen-2.5-32b"


chat = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name=model_name
)
tokenizer = tiktoken.get_encoding("cl100k_base")  # Adjust for your LLM

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(index_name)
embedding_model = SentenceTransformer("sentence-transformers/msmarco-bert-base-dot-v5")

def main(test_name, report, disease):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Run web search and vector database functions in parallel
        web_search_content = executor.submit(web_search, test_name, chat, SERPER_API_KEY,tokenizer,max_tokens = 4500)
        VDB_content = executor.submit(VDB_search,test_name, report, chat, disease, embedding_model, index, top_k=5)
        
        try:
            # Get the results
            web_results = web_search_content.result()
            vector_results, generated_text = VDB_content.result()
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
        
        # Pass the results to discard_irrelevant_content
        final_results = final_output(test_name, vector_results, report, web_results, disease, generated_text,chat, normal_ranges=None)
        return final_results

test_name = "CBC"
disease = "Dengue"

report = """Hemoglobin (Hb)	12.5 g/dL	13.0 - 17.0 g/dL (M) / 12.0 - 15.0 g/dL (F)
Hematocrit (Hct)	38%	38 - 50% (M) / 36 - 44% (F)
White Blood Cell (WBC) Count	3,000 cells/µL	4,000 - 11,000 cells/µL
Neutrophils	35%	40 - 75%
Lymphocytes	55%	20 - 40%
Platelet Count	75,000 cells/µL	150,000 - 450,000 cells/µL
Mean Platelet Volume (MPV)	10.5 fL	7.5 - 12.0 fL"""

start = time.time()
final_results = main(test_name, report, disease)
print(final_results)
end = time.time()

print(f"Time taken: {end - start} seconds")
print(f"Total time taken: {end - script_start} seconds")
