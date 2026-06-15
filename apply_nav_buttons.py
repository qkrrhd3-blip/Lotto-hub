import os
import re

dir_path = '.'
for filename in os.listdir(dir_path):
    if filename.endswith('.html') and filename != 'index.html':
        filepath = os.path.join(dir_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update nav links
        content = content.replace('<a href="about.html">소개</a>', '<a href="about.html" class="nav-btn">소개</a>')
        content = content.replace('<a href="articles.html">로또 칼럼</a>', '<a href="articles.html" class="nav-btn">로또 칼럼</a>')
        content = content.replace('<a href="community.html">커뮤니티</a>', '<a href="community.html" class="nav-btn">커뮤니티</a>')
        
        content = content.replace('<a href="../about.html">소개</a>', '<a href="../about.html" class="nav-btn">소개</a>')
        content = content.replace('<a href="../articles.html">로또 칼럼</a>', '<a href="../articles.html" class="nav-btn">로또 칼럼</a>')
        content = content.replace('<a href="../community.html">커뮤니티</a>', '<a href="../community.html" class="nav-btn">커뮤니티</a>')

        # Update cache version for css and js
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=13', content)
        content = re.sub(r'script\.js\?v=\d+', 'script.js?v=13', content)
        content = re.sub(r'auth\.js\?v=\d+', 'auth.js?v=13', content)
        content = re.sub(r'community\.js\?v=\d+', 'community.js?v=13', content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
print('All HTML files patched successfully.')
