from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
import os
import dotenv


dotenv.load_dotenv('.env')
APPWRITE_API = os.getenv('APPWRITE_API_KEY')
DATABASE_ID = os.getenv('DATABASE_ID')
PROJECT_ID = os.getenv('PROJECT_ID')

FEEDBACK_ID = os.getenv('FEEDBACK_ID')
MEDICAL_REPORTS_ID = os.getenv('MEDICAL_REPORTS_ID')
INTERPRETATIONS_ID = os.getenv('INTERPRETATIONS_ID')
SCORES_ID = os.getenv('SCORES_ID')

client = Client()
client.set_endpoint("https://cloud.appwrite.io/v1")
client.set_project(PROJECT_ID)
client.set_key(APPWRITE_API)  # Use a server-side key

database = Databases(client)


def store_report(user_id, test_name, disease, report):
    report_response = database.create_document(
        database_id = DATABASE_ID,
        collection_id = MEDICAL_REPORTS_ID,
        document_id=ID.unique(),
        data={"user_id": user_id, "test_name": test_name, "disease": disease, "report": report}
    )
    return report_response["$id"]  # Returning report_id

def store_interpretation(report_id, interpretation_web, interpretation_vdb, final_output):
    database.create_document(
        database_id = DATABASE_ID,
        collection_id = INTERPRETATIONS_ID,
        document_id=ID.unique(),
        data={"report_id": report_id, "interpretation_web": interpretation_web, 
              "interpretation_vdb": interpretation_vdb, "final_output": final_output}
    )


def store_scores(report_id, accuracy_score, relevance_score):
    database.create_document(
        database_id = DATABASE_ID,
        collection_id = SCORES_ID,
        document_id=ID.unique(),
        data={"report_id": report_id, "accuracy_score": accuracy_score, "relevance_score": relevance_score}
    )

def store_feedback(report_id, feedback):
    database.create_document(
        database_id = DATABASE_ID,
        collection_id = FEEDBACK_ID,
        document_id=ID.unique(),
        data={"report_id": report_id, "feedback": feedback}
    )


def store_sample_report():
    try:
        report_data = {
            "user_id": 1,
            "test_name": "Complete Blood Count (CBC)",
            "disease": "Anemia",
            "report": """Test Name: CBC
            Hemoglobin: 10.5 g/dL (Low)
            WBC Count: 7,500 /µL (Normal)
            RBC Count: 4.2 million/µL (Low)
            Platelets: 250,000 /µL (Normal)
            Conclusion: Mild anemia detected, further tests recommended.""",
        }

        # Insert the report into the database
        response = database.create_document(
            database_id = DATABASE_ID,
            collection_id = MEDICAL_REPORTS_ID,
            document_id=ID.unique(),  # Auto-generate unique ID
            data=report_data
        )

        print("Report successfully stored:", response)

    except Exception as e:
        print("Error storing report:", e)

# Run the function to store a sample report
store_sample_report()
