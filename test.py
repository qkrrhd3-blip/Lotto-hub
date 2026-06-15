import json
import urllib.request
try:
    data = urllib.request.urlopen('https://smok95.github.io/lotto/results/all.json').read()
    draws = json.loads(data)
    latestDraw = draws[-1]
    
    def getColorClass(num):
        if num <= 10: return 'color-yellow'
        if num <= 20: return 'color-blue'
        if num <= 30: return 'color-red'
        if num <= 40: return 'color-gray'
        return 'color-green'

    ballsHtml = ''.join([f'<div class="ball {getColorClass(n)}">{n}</div>' for n in latestDraw['numbers']])
    ballsHtml += f'<div style="font-size: 1.5rem; font-weight: bold; color: var(--text-muted); margin: 0 5px;">+</div>'
    ballsHtml += f'<div class="ball {getColorClass(latestDraw["bonus_no"])}">{latestDraw["bonus_no"]}</div>'
    print(ballsHtml)
except Exception as e:
    print('Error:', e)
