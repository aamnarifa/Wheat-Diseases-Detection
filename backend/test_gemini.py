import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in .env")
        return

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Hello! Are you working?")
        print("Success! Gemini API is working.")
        print(f"Response from Gemini: {response.text}")
    except Exception as e:
        print(f"Error testing Gemini API: {e}")

if __name__ == "__main__":
    test_gemini()
