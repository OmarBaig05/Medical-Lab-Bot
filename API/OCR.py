import base64
import re
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from typing import List, Dict
from groq import Groq
import os
import dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from starlette.responses import PlainTextResponse

# Load environment variables
dotenv.load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables")

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

# Define Pydantic model for structured output (Pydantic V2)
class LabReport(BaseModel):
    test_name: str = Field(description="The name of the medical lab test (e.g., Complete Blood Count, Lipid Profile)")
    table_data: List[Dict[str, str]] = Field(description="List of dictionaries containing the lab report data.")

# Initialize FastAPI app
app = FastAPI(title="Medical Lab Report Extractor", description="Extracts lab report details from images and returns a LaTeX table.")

def process_image(chat_instance, image_content: bytes):
    def encode_image(image_content):
        return base64.b64encode(image_content).decode('utf-8')

    base64_image = encode_image(image_content)

    def request_llm(base64_image, attempt=1):
        parser = PydanticOutputParser(pydantic_object=LabReport)
        
        # Prompt for LaTeX table output without specifying column names
        prompt = f"""Extract the medical lab report details from the provided image and format them as a LaTeX table. Include the test name as the table caption and all relevant table data from the report, ensuring that units are preserved and no lab-related details are omitted. Ignore unnecessary information like patient name, address, or anything else not related to the lab data. Ensure accurate readings and units from the image. Return ONLY the LaTeX table code, starting with \\begin{{table}} and ending with \\end{{table}}, with no additional text or explanations. The table structure should align with this format: {parser.get_format_instructions()}"""
        
        # Modify prompt for second attempt
        if attempt > 1:
            prompt = f"""Extract the medical lab report information from the image, focusing only on the test name and all relevant report data. Ignore irrelevant details like patient name or address. Format the output as a LaTeX table with the test name as the caption, including all lab data with accurate readings and units. Return ONLY the LaTeX table code, starting with \\begin{{table}} and ending with \\end{{table}}, with no additional text. The table structure should align with: {parser.get_format_instructions()}"""

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
    
    latex_table = parse_response_to_latex(response)
    
    if not latex_table:
        response = request_llm(base64_image, attempt=2)
        latex_table = parse_response_to_latex(response)
    
    return latex_table

def parse_response_to_latex(response: str) -> str:
    """
    Parse the model response to extract and validate a LaTeX table with dynamic columns.
    
    Args:
        response (str): Raw response from the model.
    
    Returns:
        str: LaTeX table code or empty string if parsing fails.
    """
    try:
        # Extract LaTeX table
        pattern = re.compile(r'\\begin{table}.*?\\end{table}', re.DOTALL)
        match = pattern.search(response)
        if not match:
            raise ValueError("No valid LaTeX table found")
        
        latex_table = match.group(0).strip()
        
        # Validate structure by converting to JSON-like format for Pydantic
        lines = latex_table.split('\n')
        test_name = ""
        table_data = []
        in_tabular = False
        headers = None
        
        for i, line in enumerate(lines):
            line = line.strip()
            if line.startswith("\\caption{"):
                test_name = line[len("\\caption{"):-1]
            if line.startswith("\\begin{tabular}"):
                in_tabular = True
                continue
            if line.startswith("\\end{tabular}"):
                in_tabular = False
                continue
            if in_tabular:
                if line.startswith("\\hline") or not line:
                    continue
                # First non-hline row is assumed to be headers
                if headers is None and not line.startswith("Parameter"):
                    headers = [h.strip().replace("\\", "") for h in line.split('&') if h.strip()]
                    continue
                # Parse table row dynamically based on headers
                if headers:
                    parts = [p.strip() for p in line.split('&')]
                    if len(parts) >= len(headers):  # Ensure row has at least as many columns as headers
                        row = {headers[i]: parts[i].replace("\\", "").split('\\\\')[0] for i in range(len(headers))}
                        table_data.append(row)
        
        # Validate with Pydantic
        if not test_name or not table_data:
            raise ValueError("Incomplete table data extracted")
        lab_report = LabReport(test_name=test_name, table_data=table_data)
        lab_report.model_dump()  # Ensure validation
        
        return latex_table
    except Exception as e:
        print(f"Error parsing LaTeX table: {e}")
        return ""

# FastAPI endpoint to process image upload
@app.post("/extract-lab-report", response_class=PlainTextResponse)
async def extract_lab_report(file: UploadFile = File(...)):
    """
    Extract medical lab report details from an uploaded image and return a LaTeX table.
    
    Args:
        file: Uploaded image file (e.g., JPEG, PNG).
    
    Returns:
        str: LaTeX table code.
    
    Raises:
        HTTPException: If the file is invalid or processing fails.
    """
    try:
        # Read the uploaded file content
        image_content = await file.read()
        
        if not image_content:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Process the image
        latex_table = process_image(client, image_content)
        
        if not latex_table:
            raise HTTPException(status_code=500, detail="Failed to extract lab report data")
        
        return latex_table
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# Run the app (for local testing)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)