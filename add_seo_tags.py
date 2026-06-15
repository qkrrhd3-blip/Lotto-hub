import os
import glob
import re

html_files = glob.glob('article-*.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', content)
    title = title_match.group(1) if title_match else "Lotto hub"
    
    # Extract description
    desc_match = re.search(r'<meta name="description" content="(.*?)">', content)
    desc = desc_match.group(1) if desc_match else "Lotto hub 칼럼"
    
    # Check if keywords already exist to avoid duplication
    if '<meta name="keywords"' not in content:
        # Create new SEO tags
        keywords = f"로또, 로또 당첨번호, 로또 분석, 통계 분석, 인공지능 로또, 로또 칼럼, {title.replace(' | Lotto hub', '')}"
        
        seo_tags = f"""    <meta name="keywords" content="{keywords}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="https://lottomindai.com/icon.png">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://lottomindai.com/{f}">"""
        
        # Inject after description
        content = re.sub(r'(<meta name="description" content=".*?">)', r'\1\n' + seo_tags, content)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Added SEO tags to {f}")
    else:
        print(f"SEO tags already exist in {f}")

# Also do it for articles.html
f = 'articles.html'
with open(f, 'r', encoding='utf-8') as file:
    content = file.read()
if '<meta name="keywords"' not in content:
    seo_tags = """    <meta name="keywords" content="로또, 로또 당첨번호, 로또 칼럼, 로또 분석, 로또 통계, 로또 비법">
    <meta property="og:title" content="로또 분석 칼럼 모음 | Lotto hub">
    <meta property="og:description" content="20가지 AI 및 통계 분석 기법을 다루는 전문 로또 칼럼 모음집입니다.">
    <meta property="og:image" content="https://lottomindai.com/icon.png">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://lottomindai.com/articles.html">"""
    content = re.sub(r'(<meta name="description" content=".*?">)', r'\1\n' + seo_tags, content)
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Added SEO tags to {f}")
