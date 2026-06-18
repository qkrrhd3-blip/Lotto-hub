import os

target = '<a href="articles.html" class="nav-btn">로또 칼럼</a>'
replacement = '<a href="articles.html" class="nav-btn">로또 칼럼</a>\n                <a href="analysis.html" class="nav-btn">당첨번호 분석</a>'

count = 0
for file in os.listdir('.'):
    if file.endswith('.html'):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if target in content and replacement not in content:
            new_content = content.replace(target, replacement)
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1

print(f"Successfully updated {count} files.")
