import requests
from bs4 import BeautifulSoup
import pandas as pd
from urllib.parse import urlparse, unquote
import re



# Define headers to simulate a browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
}

# Initialize lists to store data
tests_link = []
all_tests = []
scraped_data = []


# Function to extract all test links from the main page
def scrape_test_links():
    base_url = "https://www.testing.com/tests/"
    response = requests.get(base_url,headers=HEADERS)
    
    if response.status_code != 200:
        print("Failed to retrieve the main page.")
        return
    
    soup = BeautifulSoup(response.content, "html.parser")
    
    # Find the div with id "div-iJkeHw"
    container_div = soup.find("div", class_="column")
    if not container_div:
        print("Could not find the div with class_='column'.")
        return
    
    # Extract all li tags within the ul tag
    li_tags = container_div.find("ul").find_all("li")
    
    for li in li_tags:
        # Extract href links from the anchor tags
        link = li.find("a")["href"]
        tests_link.append(link)
    
    print(f"Extracted {len(tests_link)} links from the main page.")


# Function to scrape all links from individual test pages
def scrape_all_test_links():
    global all_tests
    for link in tests_link:
        try:
            response = requests.get(link,headers=HEADERS)
            if response.status_code != 200:
                print(f"Failed to retrieve page: {link}")
                continue
            
            soup = BeautifulSoup(response.content, "html.parser")
            
            # Extract all anchor hrefs inside the div with class "table-white-space"
            table_div = soup.find("div", class_="table-white-space")
            if table_div:
                anchors = table_div.find_all("a", href=True)
                for anchor in anchors:
                    all_tests.append(anchor["href"])
        except Exception as e:
            print(f"Error processing link {link}: {e}")
    
    # Remove duplicates
    all_tests = list(set(all_tests))
    print(f"Total unique links extracted: {len(all_tests)}")
    
    # Save links to CSV
    pd.DataFrame({"Links": all_tests}).to_csv("testing_links.csv", index=False)
    print("Links saved to testing_links.csv.")


# Function to scrape content from all test pages
def scrape_test_page_content():
    counter = 1
    for link in all_tests:
        try:
            response = requests.get(link, headers=HEADERS)
            if response.status_code != 200:
                print(f"Failed to retrieve page: {link}")
                continue
            
            soup = BeautifulSoup(response.content, "html.parser")
            
            # Extract and clean the test name from the URL
            if link.startswith("https://www.testing.com/tests/"):
                test_name_raw = link.replace("https://www.testing.com/tests/", "")
            elif link.startswith("https://www.testing.com/"):
                test_name_raw = link.replace("https://www.testing.com/", "")
            else:
                test_name_raw = link
            
            # Remove slashes and dashes, replacing them with spaces
            test_name = re.sub(r"[/-]+", " ", test_name_raw).strip().title()
            print(f"{counter}. Processing page: {test_name}")
            
            # Extract content from div.content, excluding specific sections
            content_div = soup.find("div", class_="content")
            if not content_div:
                print(f"No content found on page: {link}")
                continue
            
            sections = content_div.find_all("section")
            content_lines = []
            
            for section in sections:
                section_id = section.get("id", "")
                if section_id in [
                    "sec-_resources-section",
                    "sec-_related_tests-section",
                    "sec-_sources-section",
                    "sec-_the_best_at_home_chlamydia_tests_compared-section",
                    "sec-_the_best_at_home_herpes_tests_compared-section",
                    "sec-_benefits_and_downsides_of_the_at_home_stress_and_sleep_test-section",
                    "sec-_types_of_at_home_tests-section",
                    "sec-_benefits_and_downsides_of_at_home_thyroid_testing-section",
                    "_benefits_and_downsides_of_at_home_vitamin_d_test",
                    "sec-_the_best_at_home_covid_19_pcr_tests_compared-section",
                    "sec-_benefits_and_downsides_of_at_home_covid_19_pcr_tests-section",
                    "sec-_the_best_at_home_covid_19_pcr_tests-section",
                ]:
                    continue
                
                # Skip sections with sub-divs containing specific classes
                if section.find("div", class_=["test-kit-wrap", "kit-body", "row-wrap"]):
                    continue
                
                # Collect text content
                section_text = section.get_text(separator="\n", strip=True)
                if section_text:
                    content_lines.append(section_text)
            
            # Concatenate all content into a single line
            content = " ".join(content_lines).replace("\n", " ").strip()
            
            # Append the scraped data
            scraped_data.append({
                "Test Name": test_name,
                "Content": content,
                "URL": link
            })
            counter += 1
        except Exception as e:
            print(f"Error processing page {link}: {e}")
            counter += 1
    
    # Save scraped data to CSV
    pd.DataFrame(scraped_data).to_csv("testing_scraped_content.csv", index=False)
    print("Scraped data saved to testing_scraped_content.csv.")



if __name__ == "__main__":
    # print("Scraping links from the main page...")
    # scrape_test_links()
    
    # print("Scraping all test links...")
    # scrape_all_test_links()

    all_tests = pd.read_csv("testing_links.csv")["Links"].tolist()
    all_tests = list(set(all_tests))
    
    print("Scraping content from all test pages...")
    scrape_test_page_content()
