import urllib.request
import json
import concurrent.futures
import time
from datetime import datetime

# Calculate latest draw number
# Draw 1 was on 2002-12-07
base_date = datetime(2002, 12, 7)
now = datetime.now()
days_passed = (now - base_date).days
latest_draw = (days_passed // 7) + 1

db = {}

def fetch_draw(draw_no):
    url = f"https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={draw_no}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('returnValue') == 'success':
                return draw_no, {
                    "numbers": [data[f'drwtNo{i}'] for i in range(1, 7)],
                    "bonus": data['bnusNo'],
                    "date": data['drwNoDate']
                }
    except Exception as e:
        print(f"Error fetching draw {draw_no}: {e}")
    return draw_no, None

print(f"Fetching {latest_draw} draws from DHLottery...")

start_time = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    futures = {executor.submit(fetch_draw, i): i for i in range(1, latest_draw + 1)}
    for future in concurrent.futures.as_completed(futures):
        draw_no, data = future.result()
        if data:
            db[draw_no] = data
        if draw_no % 100 == 0:
            print(f"Fetched up to draw {draw_no}...")

# Sort and save
sorted_db = {k: db[k] for k in sorted(db.keys())}
with open("lotto_db.json", "w", encoding="utf-8") as f:
    json.dump(sorted_db, f)

print(f"Successfully saved {len(sorted_db)} draws to lotto_db.json in {time.time() - start_time:.2f} seconds.")
