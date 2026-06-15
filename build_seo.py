import urllib.request
import json
import os
from datetime import datetime
try:
    import indexing_api
except ImportError:
    indexing_api = None

# 1. Fetch latest all.json data
url = "https://smok95.github.io/lotto/results/all.json"
try:
    response = urllib.request.urlopen(url)
    data = json.loads(response.read().decode('utf-8'))
except Exception as e:
    print("Error fetching all.json:", e)
    exit(1)

# 2. Template for post-XXXX.html
html_template = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>제{drawNo}회 로또 당첨번호 분석 및 예측 | Lotto hub</title>
    <meta name="description" content="제{drawNo}회 로또 당첨번호 {numbers} + {bonus} 에 대한 AI 통계 분석 결과 및 다음 회차 출현 확률 예측 데이터를 확인하세요.">
    <meta name="keywords" content="로또 {drawNo}회, 로또 당첨번호, 로또 분석, 로또 AI 예측, Lotto hub">
    
    <!-- Open Graph SEO -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Lotto hub">
    <meta property="og:title" content="제{drawNo}회 로또 당첨번호 통계 및 패턴 분석">
    <meta property="og:description" content="제{drawNo}회 로또 당첨번호 {numbers} + 보너스 {bonus}. 이 번호들에 숨겨진 통계적 패턴과 21가지 알고리즘이 분석한 결과를 확인하세요.">
    <meta property="og:url" content="https://lottomindai.com/post-{drawNo}.html">
    <meta property="og:image" content="https://lottomindai.com/icon.png">
    
    <link rel="icon" href="icon.png">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1 class="logo">
                <img src="icon.png" alt="Lotto hub" style="width: 36px; height: 36px; border-radius: 6px; vertical-align: middle;">
                <a href="index.html" style="text-decoration:none; color:inherit; margin-left:10px;">Lotto hub</a>
            </h1>
            <nav class="nav">
                <a href="about.html" class="nav-btn">소개</a>
                <a href="articles.html" class="nav-btn">로또 칼럼</a>
                <a href="community.html" class="nav-btn">커뮤니티</a>
            </nav>
        </div>
    </header>

    <main class="container" style="padding: 40px 20px; min-height: 70vh;">
        <article style="max-width: 800px; margin: 0 auto; background: var(--bg-card, #fff); padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e2e8f0);">
            <h2 style="font-size: 1.8rem; margin-bottom: 10px; color: var(--text-main);">제{drawNo}회 로또 당첨번호 AI 분석</h2>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 30px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                작성자: <strong>Lotto hub 관리자</strong> &nbsp;|&nbsp; 추첨일: {date}
            </div>
            
            <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main);">
                <p>제<strong>{drawNo}회</strong> 동행복권 로또 추첨 결과입니다.</p>
                
                <div style="background: rgba(0,102,204,0.05); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid var(--primary-color);">
                    <h3 style="margin-top: 0;">당첨 번호</h3>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color); letter-spacing: 2px;">
                        {numbers} <span style="color: #64748b; font-size: 1.2rem;">+ 보너스 {bonus}</span>
                    </div>
                </div>

                <p>이번 회차 당첨 번호는 AI 통계 알고리즘이 분석한 21가지 패턴 중 흥미로운 출현 분포를 보였습니다.<br>
                자세한 번호대별 분포, 홀짝 비율, 이전 회차와의 연속성 분석 및 명리학 오행 통계 정보는 Lotto hub 메인 페이지의 AI 추출기에서 무료로 확인 및 적용하실 수 있습니다.</p>
                
                <p style="margin-top: 30px; text-align: center;">
                    <a href="index.html" class="btn-primary" style="display:inline-block; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; background: #0066cc; color: white;">내 사주로 최적의 로또 번호 무료 추출하기</a>
                </p>
            </div>
        </article>
        <div style="text-align: center; margin-top: 30px;">
            <a href="community.html" style="color: var(--text-muted); text-decoration: none; font-weight: bold;">← 커뮤니티 목록으로 돌아가기</a>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 Lotto hub. All rights reserved.</p>
        </div>
    </footer>
    <script src="auth.js"></script>
</body>
</html>
"""

# 3. Generate static HTML files
static_pages = ['index.html', 'about.html', 'articles.html', 'community.html', 'terms.html', 'privacy.html']
for i in range(1, 22):
    static_pages.append(f"article-{i}.html")
dynamic_pages = []

print("Generating SEO optimized static posts...")
new_posts_count = 0

for draw in data:
    drawNo = draw['draw_no']
    date = draw['date'].split('T')[0]
    nums = [str(n) for n in draw['numbers']]
    numbers_str = ", ".join(nums)
    bonus = str(draw['bonus_no'])
    
    html_content = html_template.format(
        drawNo=drawNo,
        date=date,
        numbers=numbers_str,
        bonus=bonus
    )
    
    filename = f"post-{drawNo}.html"
    is_new_file = not os.path.exists(filename)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    dynamic_pages.append(filename)
    
    if is_new_file:
        new_posts_count += 1
        # Notify Google only for newly generated posts
        if indexing_api:
            indexing_api.notify_google(f"https://lottomindai.com/{filename}")

print(f"Generated {len(dynamic_pages)} static posts. ({new_posts_count} new posts indexed)")

# 4. Generate sitemap.xml
sitemap_template = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>"""

url_template = """    <url>
        <loc>https://lottomindai.com/{page}</loc>
        <lastmod>{date}</lastmod>
        <changefreq>{freq}</changefreq>
        <priority>{priority}</priority>
    </url>"""

today = datetime.now().strftime("%Y-%m-%d")
urls_xml = []

# Add static pages
for page in static_pages:
    priority = "1.0" if page == 'index.html' else "0.8"
    urls_xml.append(url_template.format(page=page, date=today, freq="daily", priority=priority))

# Add dynamic posts
for page in dynamic_pages:
    urls_xml.append(url_template.format(page=page, date=today, freq="weekly", priority="0.6"))

sitemap_content = sitemap_template.format(urls="\n".join(urls_xml))

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap_content)

print("Generated sitemap.xml successfully.")
