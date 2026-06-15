import urllib.request
import json
import time
from datetime import datetime

base_date = datetime(2002, 12, 7)
now = datetime.now()
days_passed = (now - base_date).days
latest_draw = (days_passed // 7) + 1

db = {}

def get_lotto(draw_no):
    url = f"https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={draw_no}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})
    try:
        with urllib.request.urlopen(req, timeout=3) as response:
            text = response.read().decode('utf-8')
            data = json.loads(text)
            if data.get('returnValue') == 'success':
                return {
                    "numbers": [data[f'drwtNo{j}'] for j in range(1, 7)],
                    "bonus": data['bnusNo']
                }
    except Exception as e:
        pass
    return None

print(f"Fetching {latest_draw} draws sequentially to avoid rate limits. This will take about 1-2 minutes...")

for i in range(1, latest_draw + 1):
    result = get_lotto(i)
    if result:
        db[i] = result
    else:
        # retry once with delay
        time.sleep(0.5)
        result = get_lotto(i)
        if result:
            db[i] = result
        else:
            print(f"Failed to fetch draw {i}")
            
    if i % 50 == 0:
        print(f"Progress: {i}/{latest_draw} draws fetched...")
        # Save intermediate
        with open("lotto_db.json", "w", encoding="utf-8") as f:
            json.dump(db, f)
            
    time.sleep(0.02) # Small delay to prevent blocking

with open("lotto_db.json", "w", encoding="utf-8") as f:
    json.dump(db, f)

print(f"SUCCESS: Fetched {len(db)} draws and saved to lotto_db.json")
