import requests
from bs4 import BeautifulSoup
import pandas as pd


# Initialize lists to store scraped data
test_medlineplus_data = []
test_links = []

# Scrape MedlinePlus (limited to 2 tests for testing purposes)
def scrape_medlineplus():
    base_url = "https://medlineplus.gov/lab-tests/"
    
    # Send a GET request to the base URL
    response = requests.get(base_url)
    if response.status_code != 200:
        print("Failed to retrieve MedlinePlus base page.")
        return
    
    # Parse the HTML
    soup = BeautifulSoup(response.content, "html.parser")
    
    # Find links to tests (limiting to 2 links for testing)
    alphabets = ["A","B","C","D","E","F","G","H","I","K","L","M","N","O","P","R","S","T","U","V","W","X","Y","Z","0-9"]
    for x in alphabets:
        for a in soup.select(f"div#section_{x} ul.withident.breaklist li a"):
            test_links.append(f"{a['href']}")

    print(len(test_links))
    for link in test_links:
        try:
            # Visit each test link
            test_response = requests.get(link)
            test_soup = BeautifulSoup(test_response.content, "html.parser")
            
            # Extract test details
            test_name = test_soup.find("div", class_="page-title").get_text(strip=True)
            main_div = test_soup.find("div", class_="main")
            sections = main_div.find_all("section")[:-1]  # Seect all sections except the last one
            description = " ".join([section.get_text(" ",strip=True) for section in sections])
            description = " ".join(description.split())
            # Append to list
            test_medlineplus_data.append({
                "Test Name": test_name,
                "Description": description,
                "Source": "MedlinePlus",
                "URL": link
            })
        except Exception as e:
            print(f"Error scraping {link}: {e}")



# Save scraped data to CSV
def save_data():
    # Combine the scraped data
    combined_data = test_medlineplus_data
    df = pd.DataFrame(combined_data)
    
    # Save to CSV
    df.to_csv("medical_tests_interpretation.csv", index=False)
    print("Data saved to medical_tests_interpretation.csv")


if __name__ == "__main__":
    print("Scraping MedlinePlus...")
    scrape_medlineplus()
    
    print("Saving data...")
    save_data()
