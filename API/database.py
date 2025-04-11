from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
import os
import json
from appwrite.query import Query
import dotenv


dotenv.load_dotenv('.env')
APPWRITE_API = os.getenv('APPWRITE_API_KEY')
DATABASE_ID = os.getenv('DATABASE_ID')
PROJECT_ID = os.getenv('PROJECT_ID')
END_POINT = os.getenv('END_POINT')

# FEEDBACK_ID = os.getenv('FEEDBACK_ID')
# MEDICAL_REPORTS_ID = os.getenv('MEDICAL_REPORTS_ID')
# INTERPRETATIONS_ID = os.getenv('INTERPRETATIONS_ID')
# SCORES_ID = os.getenv('SCORES_ID')
WEB_SEARCH_DATA_ID = os.getenv('WEB_SEARCH_DATA_ID')

client = Client()
client.set_endpoint(END_POINT)
client.set_project(PROJECT_ID)
client.set_key(APPWRITE_API)  # Use a server-side key

database = Databases(client)



def store_test_data(test_name, web_summarized_data):
    response = database.create_document(
        database_id = DATABASE_ID,
        collection_id = WEB_SEARCH_DATA_ID,
        document_id=ID.unique(),
        data={"test_name": test_name, "web_summarized_data": web_summarized_data}
    )
    return response

def retrieve_test_data(test_name):
    response = database.list_documents(
        database_id=DATABASE_ID,
        collection_id=WEB_SEARCH_DATA_ID,
        queries=[Query.equal("test_name", test_name)]
    )
    return response


# data = retrieve_test_data("CBC")
def parse_data(data):
    if data.get("documents"):  # Ensure documents exist
        document = data["documents"][0]  # First document
        test_name = document.get("test_name", "N/A")
        web_summarized_data = document.get("web_summarized_data", "N/A")
        return test_name, web_summarized_data
    else:
        return None, None

def complete_retrival(test_name):
    data = retrieve_test_data(test_name)
    return parse_data(data)


# test_name, web_summarized_data = parse_data(data)
# print(test_name, web_summarized_data)








# def store_report(user_id, test_name, disease, report):
#     report_response = database.create_document(
#         database_id = DATABASE_ID,
#         collection_id = MEDICAL_REPORTS_ID,
#         document_id=ID.unique(),
#         data={"user_id": user_id, "test_name": test_name, "disease": disease, "report": report}
#     )
#     return report_response["$id"]  # Returning report_id

# def store_interpretation(report_id, interpretation_web, interpretation_vdb, final_output):
#     database.create_document(
#         database_id = DATABASE_ID,
#         collection_id = INTERPRETATIONS_ID,
#         document_id=ID.unique(),
#         data={"report_id": report_id, "interpretation_web": interpretation_web, 
#               "interpretation_vdb": interpretation_vdb, "final_output": final_output}
#     )


# def store_scores(report_id, accuracy_score, relevance_score):
#     database.create_document(
#         database_id = DATABASE_ID,
#         collection_id = SCORES_ID,
#         document_id=ID.unique(),
#         data={"report_id": report_id, "accuracy_score": accuracy_score, "relevance_score": relevance_score}
#     )

# def store_feedback(report_id, feedback):
#     database.create_document(
#         database_id = DATABASE_ID,
#         collection_id = FEEDBACK_ID,
#         document_id=ID.unique(),
#         data={"report_id": report_id, "feedback": feedback}
#     )


