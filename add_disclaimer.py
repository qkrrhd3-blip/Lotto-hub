import glob
import re

html_files = glob.glob('*.html')
py_files = ['generate_articles.py', 'generate_long_articles.py']

disclaimer_html = """            <p class="disclaimer" style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px; line-height: 1.5; padding: 0 15px; word-break: keep-all;">
                <strong>면책 조항:</strong> Lotto hub에서 제공하는 모든 분석 정보 및 번호는 통계 및 AI 모델에 기반한 참고 자료일 뿐, 로또 당첨을 완벽하게 보장하지 않습니다. 복권 구매의 최종 책임은 사용자 본인에게 있으며, 무리한 구매는 금전적 손실을 초래할 수 있습니다. 소액으로 건전하게 즐기시기를 권장합니다.
            </p>
            <p>&copy;"""

# Update HTML files
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '<p class="disclaimer"' not in content:
        # Replace the copyright line to include disclaimer right above it
        content = re.sub(r'\s*<p>&copy;', '\n' + disclaimer_html, content)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Added disclaimer to {f}")

# Update Python generators
for f in py_files:
    if not glob.glob(f):
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '<p class="disclaimer"' not in content:
        content = re.sub(r'\s*<p>&copy;', '\n' + disclaimer_html, content)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Added disclaimer to {f}")
