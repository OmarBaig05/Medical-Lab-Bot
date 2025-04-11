import base64
import re

def process_image(chat_instance, image_path):
    # Function to encode the image
    def encode_image(image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    # Getting the base64 string
    base64_image = encode_image(image_path)

    def request_llm(base64_image, attempt=1):
        prompt = '''Extract the medical lab report related details from the provided image and format 
        them as a LaTeX table. Do not include any additional text, disclaimers, or notes—only return the 
        LaTeX table code. Ignore all the unnecessary information like patient name, address or anyother thing
        just provide me the lab related data/table The output should start directly with the \begin{table} tag and 
        ensure correct details and alignment according to the image.'''
        
        # Modify prompt if first attempt fails
        if attempt > 1:
            prompt = '''Extract the table related or medical lab report related information from the
            given picture, dont consider any irrelevant information, only provide
            me the report related data, preserving alignment and make sure to provide the accurate readings
            and units from the given image. 
            Only return the LaTeX table code, starting with \begin{table}.'''

        chat_completion = chat_instance.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                    ],
                }
            ],
            model="llama-3.2-90b-vision-preview",
        )
        
        return chat_completion.choices[0].message.content
    
    response = request_llm(base64_image)
    table = extract_latex_table(response)
    
    # Retry with modified prompt if no table is found
    if not table:
        response = request_llm(base64_image, attempt=2)
        table = extract_latex_table(response)
    
    return table

def extract_latex_table(response: str) -> str:
    pattern = re.compile(r'\\begin{table}.*?\\end{table}', re.DOTALL)
    
    # Search for the LaTeX table in the response
    match = pattern.search(response)
    
    if match:
        return match.group(0).strip()  # Return only the matched table content
    else:
        return ""  # Return an empty string if no LaTeX table is found
