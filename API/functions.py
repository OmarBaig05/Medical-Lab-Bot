from langchain_groq import ChatGroq
import requests
import base64
from langchain_core.output_parsers import PydanticOutputParser
import json
import re
import logging
from bs4 import BeautifulSoup
from langchain_core.output_parsers import StrOutputParser
from langchain.schema import SystemMessage, HumanMessage

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def remove_tags(text):
    pattern = re.compile(r'<think>.*?</think>', re.DOTALL)
    cleaned_text = re.sub(pattern, '', text)
    return cleaned_text

def only_p_tags(text):
    descriptions = re.findall(r"<p>(.*?)</p>", text)
    return descriptions

def get_unique_content_only(results):
    context = ''
    for search_result in results:
        for match in search_result["matches"]:
            if match['metadata']['text'] not in context:
                context += f"- {match['metadata']['text']}\n"
    return context

def retrieve_context(description, embedding_model, index, top_k):
    results = []
    for desc in description:
        query_vector = embedding_model.encode(desc).tolist()
        search_results = index.query(vector=query_vector, top_k=top_k, include_metadata=True)
        results.append(search_results)
    return results

def chunk_text(text, tokenizer, max_tokens):
    words = text.split()
    chunks = []
    current_chunk = []
    token_count = 0

    for word in words:
        word_tokens = len(tokenizer.encode(word))
        if token_count + word_tokens > max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            token_count = 0
        current_chunk.append(word)
        token_count += word_tokens

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

def scrape_and_extract(url):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        logging.error(f"Error fetching {url}: {e}")
        return None

def clean_text(text):
    if not text:
        return ""
    soup = BeautifulSoup(text, "html.parser")
    text = soup.get_text()
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def get_URLs(test_name, SERPER_API_KEY):
    search_query = f"How to interpret {test_name} report"
    payload = json.dumps({"q": search_query, "num": 2})
    headers = {'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json'}
    url = "https://google.serper.dev/search"
    try:
        response = requests.post(url, headers=headers, data=payload)
        response.raise_for_status()
        data = response.json()
        urls = [entry["link"] for entry in data.get("organic", [])]
        logging.info(f"URLs:, {urls}")
        return urls
    except requests.RequestException as e:
        logging.error(f"Error fetching URLs: {e}")
        return []

def get_interpretations_list(test_name, urls, chat, tokenizer, max_tokens):
    extracted_texts = []
    for url in urls:
        content = scrape_and_extract(url)
        logging.info(f"Extracted content from {content}")
        if content:
            cleaned_text = clean_text(content)
            extracted_texts.append(cleaned_text)

    web_content = "\n\n".join(extracted_texts)
    logging.info(f"Web content: {web_content}")
    web_content_chunks = chunk_text(web_content, tokenizer, max_tokens)

    responses = []
    for chunk in web_content_chunks:
        messages = [
            SystemMessage(content="You are a medical expert providing the relevant content from the given one."),
            HumanMessage(content=f"""Based on the following information:\n\n{chunk}\n\n extract the information
            that can help in interpreting the medical report related to {test_name} (test). Don't type 
            anything else. Just provide the relevant information from the content nothing else, if there
            is nothing relevant then just respond with 'there is nothing helpful' but don't type anything from your knowledge.""")
        ]
        response = chat(messages)
        response = remove_tags(response.content)
        responses.append(response)
    return responses

def summarize_web_content(list_of_interpretations, test_name, chat):
    interpretations = "".join(list_of_interpretations)
    chain = chat | StrOutputParser()
    prompt = f"""You are a medical expert. Summarize the provided content in a maximum of 1000 words to aid 
    in interpreting the medical report related to {test_name}. Ensure the summary remains within the word 
    limit while retaining key insights.

    Content: {interpretations}"""
    response = chain.invoke(prompt)
    response = remove_tags(response)
    return response

def generate_refined_prompt(query, type, disease, chat):
    prompt = f"""You are an expert doctor. I have provided the test type, 
    the suspected disease (if mentioned by the patient), and the lab report. Since the lab report 
    primarily consists of numerical values, retrieving relevant context from my RAG system is challenging.
    Your task is to generate a maximum of 200-300 words textual summary that best represents this report,
    incorporating key abnormalities or notable findings. Provide 2 descriptions which are inside the     
    <p>*</p> tag (don't use any other mode for separating them). This summary will be used to fetch the 
    most relevant medical context from my RAG, which, along with the report, will help the LLM provide an 
    accurate interpretation.

    For your information so that you can write the description in a familiar way, the data I have scrapped 
    is from Testing.com, medlineplus.com and some books.
    Don't write anything else, other than the relevant interpretation.
    :
    
    Type: {type}
    Disease: {disease}
    Report: {query}
        
    Answer:
    """
    chain = chat | StrOutputParser()
    response = chain.invoke(prompt)
    response = remove_tags(response)
    response = only_p_tags(response)
    return response

def discard_irrelevant_context(test_name, normal_ranges, retrieved_context, report, web_content, chat):
    prompt = f"""You are an expert doctor. Your task is to extract only the most relevant 
    information from the provided medical context and discard anything unrelated.  

### Given Information:
- **Test Type:** {test_name}  
- **Medical Report:** {report}  
- **Normal Ranges:** {normal_ranges}  
- **Context:** {retrieved_context} \n {web_content}  

### Instructions:
- Read the retrieved context carefully.  
- Identify the information that is directly relevant to the test {test_name} and the provided ranges (only
 consider the provided ranges if the normal ranges are not present in the test report, otherwise consider the provided ones).  
- Extract only the relevant paragraphs and discard anything that is not directly related.  
- Ensure that the extracted content provides useful insights about the given test.  

### Output Format:
Return the **filtered context** as clean paragraphs that are relevant to {test_name}. Do not include any unrelated information, just provide the paragraphs nothing else.  
"""
    chain = chat | StrOutputParser()
    response = chain.invoke(prompt)
    response = remove_tags(response)
    return response

def generate_final_output(report, type, disease, generated_text, context, chat):
    prompt = f"""You are an expert doctor. You have to interpret the medical lab report of the patient. I have provided 
    you the lab report, the test type, the disease which the patient thinks he is suffering from and some context which may assist you in interpreting the report.
    Interpret the report in layman understandable form in just 2 lines, not more than that and do not write anything else other than the interpretation. If you think that
    the disease he thinks he is suffering from does not match the report, you can mention that as well and recommend the possible diseases. In case the Context is not beneficial,
    you can ignore it and answer from your own knowledge.
    :
        
    Context: {context}
    Type: {type}
    Disease: {disease}
    Report: {report}
    Random Context (it can be wrong): {generated_text}
    Answer:
    """
    chain = chat | StrOutputParser()
    response = chain.invoke(prompt)
    response = remove_tags(response)
    return response

def web_search(test_name, chat1,chat2, SERPER_API_KEY, tokenizer, max_tokens):
    try:
        urls = get_URLs(test_name, SERPER_API_KEY)
        interpretation = get_interpretations_list(test_name, urls, chat1, tokenizer, max_tokens)
        text = summarize_web_content(interpretation, test_name, chat2)
        logging.info("Web search completed")
        return text
    except Exception as e:
        logging.error(f"Error during web search: {e}")
        return ""

def VDB_search(test_name, report, chat2, disease, embedding_model, index, top_k=5):
    try:
        generated_text = generate_refined_prompt(report, test_name, disease, chat2)
        retrieved_content = retrieve_context(generated_text, embedding_model, index, top_k)
        unique_content = get_unique_content_only(retrieved_content)
        logging.info("VDB search completed")
        return unique_content, generated_text
    except Exception as e:
        logging.error(f"Error during VDB search: {e}")
        return "", ""

def final_output(test_name, unique_content, report, text, disease, generated_text, chat1,chat2, normal_ranges):
    try:
        context = discard_irrelevant_context(test_name, normal_ranges, unique_content, report, text, chat1)
        response = generate_final_output(report, test_name, disease, generated_text, context, chat2)
        return response
    except Exception as e:
        logging.error(f"Error generating final output: {e}")
        return ""


from pydantic import BaseModel, Field
from typing import List

class DynamicEntry(BaseModel):
    field_name: str = Field(..., description="The label/key as it appears in the report, e.g., 'Hemoglobin', 'Result', 'Findings'")
    field_value: str = Field(..., description="The corresponding value from the report")

class LabReport(BaseModel):
    test_name: str = Field(..., description="The name of the medical lab test (e.g., CBC, Prolactin Test, Lipid Profile)")
    report_type: str = Field(..., description="Type of report: 'tabular' or 'descriptive'")
    entries: List[DynamicEntry] = Field(..., description="List of extracted key-value entries from the report")
  

import base64
import logging
import re
from langchain.output_parsers import PydanticOutputParser

def process_image(chat_instance, image_content: bytes, LabReport, k: int = 3):
    """
    Extracts structured lab report data from an image using an image-capable LLM.
    Ensures JSON output matches the LabReport Pydantic schema.
    
    Retries up to k times if parsing fails.
    """
    def encode_image(image_content):
        return base64.b64encode(image_content).decode('utf-8')

    base64_image = encode_image(image_content)
    parser = PydanticOutputParser(pydantic_object=LabReport)

    def clean_json(raw: str) -> str:
        """Remove code fences or extra text around JSON."""
        # Extract JSON between triple backticks if present
        match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", raw, re.DOTALL)
        if match:
            return match.group(1).strip()
        # Otherwise, try to find the first JSON-like block
        match = re.search(r"(\{.*\})", raw, re.DOTALL)
        if match:
            return match.group(1).strip()
        return raw.strip()

    def request_llm(base64_image, attempt=1):
        prompt = f"""
        You are an expert medical data extraction assistant. 
        Your task is to extract all the information from the lab report image into a JSON object. 

        JSON Schema:
        {parser.get_format_instructions()}

        Rules:
        - Return ONLY valid JSON (no explanations, no markdown, no ```json fences).
        - Preserve the original structure of the report.
        - Do NOT enforce fixed field names like 'parameter' or 'unit'. 
          Instead, extract fields exactly as they appear in the report (e.g., 'Result', 'Value', 'Flag', 'Observation').
        - For tabular reports, each column/row should become an entry in `entries`.
        - For descriptive/narrative reports, break down information into meaningful key-value pairs.
        - Always return strictly valid JSON.
        - Ignore irrelevant personal details (patient name, ID, address).
        """

        if attempt > 1:
            prompt = f"""
            Retry attempt {attempt}: Please extract the lab report again and return valid JSON only.
            Follow this schema strictly:
            {parser.get_format_instructions()}
            """

        messages = [
            (
                "user",
                [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            )
        ]

        response = chat_instance.invoke(messages)
        return clean_json(response.content)

    # Retry loop
    for attempt in range(1, k + 1):
        try:
            response = request_llm(base64_image, attempt)
            parsed_report = LabReport.parse_raw(response)
            logging.info(f"Successfully parsed lab report on attempt {attempt}")
            return parsed_report
        except Exception as e:
            logging.warning(f"Attempt {attempt} failed to parse JSON: {e}")
            if attempt == k:
                raise ValueError("Failed to parse lab report into valid JSON after multiple retries.")

    return None


def vanilla_model_to_interpret_report(report: str, type: str, disease: str, chat: ChatGroq) -> str:
    """
    Interpret the medical lab report using Groq LLM with a strict prompt template.
    Only TYPE, DISEASE, and REPORT are passed (no context).
    """

    prompt = f"""You are an expert doctor. You have to interpret the medical lab report of the patient. 
    I have provided you the lab report, the test type, and the disease which the patient thinks he is suffering from. 
    Interpret the report in layman understandable form in just 2 lines, not more than that, and do not write anything else other than the interpretation. 
    If you think that the disease he thinks he is suffering from does not match the report, you can mention that as well and recommend the possible diseases.
    Answer:
    
    Type: {type}
    Disease: {disease}
    Report: {report}
    """

    try:
        chain = chat | StrOutputParser()
        response = chain.invoke(prompt)
        response = remove_tags(response)
        return response
    except Exception as e:
        logging.error(f"Error interpreting lab report: {str(e)}")
        return "Error: Unable to interpret lab report."