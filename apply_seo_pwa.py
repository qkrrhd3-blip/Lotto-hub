import os
import re

dir_path = '.'
meta_tags = """    <meta name="description" content="데이터 기반 개인 맞춤형 로또 번호 추천 및 최신 당첨 결과 조회 서비스입니다.">
    <meta name="keywords" content="로또, 로또 추천, 로또 당첨번호, 로또 분석, 무료 로또 추천, 맞춤형 로또, Lotto hub">
    <meta property="og:title" content="Lotto hub | 개인 맞춤형 로또 번호 추천">
    <meta property="og:description" content="사용자의 선택과 통계를 결합한 최적의 로또 조합을 무료로 추천해 드립니다.">
    <meta property="og:image" content="./icon.png">
    <meta property="og:type" content="website">
    <link rel="icon" href="icon.png">
    <link rel="apple-touch-icon" href="icon.png">
    <link rel="manifest" href="manifest.json">"""

sw_script = """    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('sw.js').catch(err => console.log('SW setup failed'));
        });
      }
    </script>
</body>"""

for filename in os.listdir(dir_path):
    if filename.endswith('.html'):
        filepath = os.path.join(dir_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Inject Meta tags if not present
        if 'name="description"' not in content:
            # Find the title tag and append meta tags after it
            content = re.sub(r'(<title>.*?</title>)', r'\1\n' + meta_tags, content)
        
        # Inject SW script if not present
        if 'serviceWorker.register' not in content:
            content = content.replace('</body>', sw_script)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
print('SEO tags and Service Worker applied to all HTML files.')
