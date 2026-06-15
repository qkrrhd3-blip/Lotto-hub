import os

def insert_ads():
    ad_top = '''
    <!-- 애드센스 상단 광고 -->
    <div class="adsense-container top">
        <div class="adsense-placeholder">구글 애드센스 반응형 광고 (상단)</div>
    </div>
'''
    ad_bottom = '''
    <!-- 애드센스 하단 광고 -->
    <div class="adsense-container bottom">
        <div class="adsense-placeholder">구글 애드센스 반응형 광고 (하단)</div>
    </div>
'''
    ad_center = '''
    <!-- 애드센스 중앙 광고 -->
    <div class="adsense-container center">
        <div class="adsense-placeholder">구글 애드센스 반응형 광고 (중앙)</div>
    </div>
'''
    ad_sidebars = '''
    <!-- 애드센스 좌우 사이드바 광고 -->
    <div class="adsense-sidebar left">
        <div class="adsense-placeholder vertical">사이드바 광고 (좌)</div>
    </div>
    <div class="adsense-sidebar right">
        <div class="adsense-placeholder vertical">사이드바 광고 (우)</div>
    </div>
'''

    files = [f for f in os.listdir('.') if f.endswith('.html')]
    skip_files = ['terms.html', 'privacy.html']

    for file in files:
        if file in skip_files:
            continue
            
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Skip if already has ads
        if 'adsense-container top' in content:
            continue
            
        # 1. Insert Top Ad just after <main>
        if '<main>' in content:
            content = content.replace('<main>', '<main>' + ad_top)
            
        # 2. Insert Bottom Ad just before </main>
        if '</main>' in content:
            content = content.replace('</main>', ad_bottom + '</main>')
            
        # 3. Insert Center Ad
        # For index.html: after <section id="features">
        if file == 'index.html' and '</section>' in content:
            # find first </section>
            parts = content.split('</section>', 1)
            content = parts[0] + '</section>' + ad_center + parts[1]
        elif 'article-' in file and 'article-body' in content:
            # For articles: insert in the middle of article-body
            parts = content.split('</p>', 2)
            if len(parts) >= 3:
                content = parts[0] + '</p>' + parts[1] + '</p>' + ad_center + "".join(parts[2:])
        else:
            # General fallback: after first </section> or </div> inside main
            if '</section>' in content:
                parts = content.split('</section>', 1)
                content = parts[0] + '</section>' + ad_center + parts[1]
                
        # 4. Insert Sidebars before </body>
        if '</body>' in content:
            content = content.replace('</body>', ad_sidebars + '\n</body>')
            
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Injected ads into {file}")

if __name__ == '__main__':
    insert_ads()
