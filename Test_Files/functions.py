import requests
import json
import re
from bs4 import BeautifulSoup
from langchain_core.output_parsers import StrOutputParser
from langchain.schema import SystemMessage, HumanMessage



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

def retrieve_context(description,embedding_model,index,top_k):
    results = []

    for i in range(len(description)):
        query_vector = embedding_model.encode(description[i]).tolist()
        search_results = index.query(vector=query_vector, top_k = top_k, include_metadata=True)
        results.append(search_results)
    return results

def chunk_text(text,tokenizer, max_tokens):
    """Splits text into token-based chunks without cutting sentences abruptly."""
    
    words = text.split()

    chunks = []
    current_chunk = []
    token_count = 0

    for word in words:
        word_tokens = len(tokenizer.encode(word))  # Get token count for each word

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
    """Scrape the webpage content."""
    try:
        headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an error for bad status codes
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def clean_text(text):
    """
    Cleans extracted web content by:
    - Removing HTML tags
    - Replacing multiple spaces/newlines/tabs with a single space
    - Stripping leading/trailing whitespace
    """
    if not text:
        return ""

    # Remove HTML tags using BeautifulSoup
    soup = BeautifulSoup(text, "html.parser")
    text = soup.get_text()

    # Remove extra spaces, newlines, and tabs
    text = re.sub(r"\s+", " ", text)

    return text.strip()

def get_URLs(test_name,SERPER_API_KEY):
    """Search the web, scrape results, and generate an LLM response."""
    search_query = f"How to interpret {test_name} report"

    payload = json.dumps({
        "q": search_query,
        "num": 2
    })
    headers = {
    'X-API-KEY': SERPER_API_KEY,
    'Content-Type': 'application/json'
    }
    url = "https://google.serper.dev/search"
    response = requests.request("POST", url, headers=headers, data=payload) 
    data = json.loads(response.text)
    
    # Extract URLs from the "organic" search results
    urls = [entry["link"] for entry in data.get("organic", [])]

    return urls


def get_interpretations_list(test_name,urls,chat,tokenizer,max_tokens):
    
    extracted_texts = []
    for url in urls:
            content = scrape_and_extract(url)
            if content:
                cleaned_text = clean_text(content)
                extracted_texts.append(cleaned_text)

    web_content = "\n\n".join(extracted_texts)
    web_content_chunks = chunk_text(web_content,tokenizer,max_tokens)

    responses = []
    for i in range(len(web_content_chunks)):
        messages = [
            SystemMessage(content="You are a medical expert providing the relavent content from the given one."),
            HumanMessage(content=f"""Based on the following information:\n\n{web_content_chunks[i]}\n\n extract the information
        that can help in interpreting the medical report related to {test_name} (test). Don't type 
        anything else. Just provide the relavent information from the content nothing else, if there
        is nothing relevant then just response with there is nothing helpful but dont type anything from your knowledge.""")
        ]
        response = chat(messages)
        response = remove_tags(response.content)
        responses.append(response)
        
    return responses

def summarize_web_content(list_of_interpretations, test_name,chat):
    """Summarize the interpretations."""
    # Join the interpretations into a single string
    interpretations = "".join(list_of_interpretations)
    chain = chat | StrOutputParser()

    prompt = f"""You are a medical expert. Summarize the provided content in a maximum of 1000 words to aid 
    in interpreting the medical report related to {test_name}. Ensure the summary remains within the word 
    limit while retaining key insights.

    Content: {interpretations}"""

    response = chain.invoke(prompt)
    response = remove_tags(response)
    return response


def generate_refined_prompt(query,type,disease,chat):
    
    # Construct prompt
    prompt = f"""You are an expert doctor. I have provided the test type, 
    the suspected disease (if mentioned by the patient), and the lab report. Since the lab report 
    primarily consists of numerical values, retrieving relevant context from my RAG system is challenging.
    Your task is to generate a maximum of 200-300 words textual summary that best represents this report,
    incorporating key abnormalities or notable findings. Provide 2 descriptions which are inside the     
    <p>*</p> tag (don't use any other mode for separating them). This summary will be used to fetch the 
    most relevant medical context from my RAG, which, along with the report, will help the LLM provide an 
    accurate interpretation.

    For your information so that you can write the desrciption in a familiar way, the data i have scrapped 
    is from Testing.com, medlinplus.com and some books.
    Don't write anything else, other than the relavant interpretation.
    :
    
    Type: {type}
    Diesease: {disease}
    Report: {query}
        
    Answer:
    """
    
    chain = chat | StrOutputParser()
    
    response = chain.invoke(prompt)
    response = remove_tags(response)
    response = only_p_tags(response)
    return response # returns the list of 2 description


def discard_irrelevant_context(test_name,normal_ranges,retrieved_context,report,web_content,chat):
    
    # Construct prompt
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
    return response # final paragraphs


def generate_final_output(report,type,disease,generated_text,context,chat):
    
    
    # Construct prompt
    prompt = f"""You are a expert doctor. You have to interpret the medical lab report of the patient. I have provided 
    you the lab report, the test type, the disease which the patient thinks he is suffereing from and some context which may assist you in interpreting the report.
    Interpret the report in layman understandable form in just 2 lines, not more than that and donot write anything else other than the interpretation. If you think that
    the disease he thinks he is suffering from do not match the report, you can mention that as well and recommend the possible diseases.In case the Context is not benificial,
    you can ignore it and answer from your own knowledge. Also score your answer out of 10, but just the number in the markdown form, nothing else. The answer should not be more than 2 to 3 lines.
    And after that also tell whether the provided context was helpful in interpretation or not, and provide the part which was helpful (it can be detailed)
    also rate the helpfullness.
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


def web_search(test_name,chat,SERPER_API_KEY,tokenizer,max_tokens):
    urlss = get_URLs(test_name,SERPER_API_KEY)
    interpretation = get_interpretations_list(test_name,urlss,chat,tokenizer,max_tokens)
    texttt = summarize_web_content(interpretation, test_name,chat)
    print("web search completed")
    return texttt

def VDB_search(test_name,report,chat,disease,embedding_model,index,top_k=5):
    generated_text = generate_refined_prompt(report,test_name,disease,chat)
    retrieved_content = retrieve_context(generated_text,embedding_model,index,top_k)
    unique_content = get_unique_content_only(retrieved_content)
    print("VDB search completed")
    return unique_content,generated_text
    
def final_output(test_name,unique_content,report,texttt,disease,generated_text,chat,normal_ranges):
    context = discard_irrelevant_context(test_name,normal_ranges,unique_content,report,texttt,chat)
    response = generate_final_output(report,test_name,disease,generated_text,context,chat)
    return response