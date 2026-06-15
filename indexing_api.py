import os
import json
import sys
try:
    import requests
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession
except ImportError:
    print("Warning: google-auth and requests packages are required for Google Indexing API.")
    sys.exit(0)

ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"

def notify_google(url, action="URL_UPDATED"):
    """
    Notify Google Indexing API about a URL update or deletion.
    action: 'URL_UPDATED' or 'URL_DELETED'
    """
    key_path = "service_account.json"
    credentials = None
    
    if os.path.exists(key_path):
        credentials = service_account.Credentials.from_service_account_file(
            key_path,
            scopes=["https://www.googleapis.com/auth/indexing"]
        )
    else:
        creds_json = os.environ.get("GOOGLE_CREDENTIALS")
        if not creds_json:
            print(f"Skipped Indexing API for {url}: No service_account.json or GOOGLE_CREDENTIALS found.")
            return False
        
        try:
            credentials = service_account.Credentials.from_service_account_info(
                json.loads(creds_json),
                scopes=["https://www.googleapis.com/auth/indexing"]
            )
        except Exception as e:
            print(f"Skipped Indexing API for {url}: Invalid GOOGLE_CREDENTIALS format ({e}).")
            return False
    
    try:
        authed_session = AuthorizedSession(credentials)
        response = authed_session.post(
            ENDPOINT,
            json={
                "url": url,
                "type": action
            }
        )
        
        if response.status_code == 200:
            print(f"SUCCESS: Google Indexing API Notified -> {url}")
            return True
        elif response.status_code == 429:
            print(f"RATE LIMIT: Google Indexing API quota exceeded for {url}.")
            return False
        else:
            print(f"FAILED: Google Indexing API -> {url} (Error: {response.status_code} {response.text})")
            return False
    except Exception as e:
        print(f"ERROR: Google Indexing API request failed -> {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python indexing_api.py <URL>")
        sys.exit(1)
        
    target_url = sys.argv[1]
    notify_google(target_url)
