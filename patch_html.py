import os

files = ['index.html', 'about.html', 'articles.html', 'article-1.html', 'article-2.html', 'community.html', 'privacy.html', 'terms.html']

old_nav = """            <nav class="nav">
                <a href="about.html">소개</a>
                <a href="articles.html">로또 칼럼</a>
                <a href="community.html">커뮤니티</a>
                <a href="index.html#generate" class="btn-primary-outline">번호 생성하기</a>
            </nav>"""

new_nav = """            <nav class="nav">
                <a href="about.html">소개</a>
                <a href="articles.html">로또 칼럼</a>
                <a href="community.html">커뮤니티</a>
                <div id="authNavContainer" style="display: flex; align-items: center; border-left: 1px solid var(--border-color); padding-left: 20px; margin-left: 10px;"></div>
            </nav>"""

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace nav
        content = content.replace(old_nav, new_nav)
        
        # Insert auth.js if not present
        if '<script src="auth.js"></script>' not in content:
            content = content.replace('</body>', '    <script src="auth.js"></script>\n</body>')
            
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
