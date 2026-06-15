import requests
from bs4 import BeautifulSoup
import csv
import time
import os

def get_lotto_numbers(draw_no):
    api_url = f"https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={draw_no}"

    try:
        response = requests.get(api_url)
        response.raise_for_status()

        data = response.json()
        if data.get('returnValue') == 'fail':
            return None
            
        print(f"{draw_no}회 결과추출 완료")
        return {
            'drwNo' : data['drwNo'],
            'date': data['drwNoDate'], 
            'lottoNumb': [str(data[f"drwtNo{i}"]) for i in range(1, 7)], 
            'bonusNumb': data['bnusNo']
        }
        
    except requests.exceptions.RequestException as e:
        print(f"오류가 발생했습니다: {e}")
        return None
        
def maxRound():
    url = "https://dhlottery.co.kr/common.do?method=main"
    html = requests.get(url).text
    soup = BeautifulSoup(html, "lxml")
    max_numb = soup.find(name="strong", attrs={"id": "lottoDrwNo"}).text
    return int(max_numb)

# 최신 회차 가져오기
print("동행복권 서버에서 최신 회차 정보를 가져오는 중...")
maxCount = maxRound()
print(f"현재 최신 회차: {maxCount}회")

# 이미 저장된 데이터가 있다면 이어서 받기 위해 파일 확인
start_round = 1
csv_filename = 'lottoRes.csv'

if os.path.exists(csv_filename):
    with open(csv_filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        if lines:
            last_line = lines[-1].strip().split(',')
            if last_line[0].isdigit():
                start_round = int(last_line[0]) + 1

if start_round > maxCount:
    print("이미 모든 로또 당첨 번호가 최신 상태로 업데이트되어 있습니다.")
else:
    mode = 'a' if start_round > 1 else 'w'
    print(f"{start_round}회부터 {maxCount}회까지 다운로드를 시작합니다...")
    
    with open(csv_filename, mode, newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile, delimiter=',')
        
        for draw_no in range(start_round, maxCount+1):
            res = get_lotto_numbers(draw_no)
            if res:
                # 순서 : 회차, 날짜, 로또번호1~6, 보너스번호
                writer.writerow([res.get('drwNo'), res.get('date')] + res.get('lottoNumb') + [res.get('bonusNumb')])
            time.sleep(0.2) # 디도스 차단 방지용 딜레이

print("로또 DB 업데이트 완료!")
