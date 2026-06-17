import glob
from datetime import datetime

html_files = glob.glob('*.html')
urls = []
for f in html_files:
    if f == 'index.html':
        url = 'https://hxahub.com/'
        priority = '1.0'
    elif f.startswith('article-'):
        url = f'https://hxahub.com/{f}'
        priority = '0.7'
    else:
        url = f'https://hxahub.com/{f}'
        priority = '0.8'
    
    urls.append(f"""    <url>
        <loc>{url}</loc>
        <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
        <priority>{priority}</priority>
    </url>""")

xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(xml_content)
