import os
import glob
import re

html_files = glob.glob('*.html')
replacement = '<h1 class="logo" style="display: flex; align-items: center; gap: 8px;">\n                <img src="icon.png" alt="Lotto hub" style="width: 28px; height: 28px; border-radius: 6px;">\n                <a href="index.html" style="text-decoration:none; color:inherit;">Lotto hub</a>\n            </h1>'

index_replacement = '<h1 class="logo" style="display: flex; align-items: center; gap: 8px;">\n                <img src="icon.png" alt="Lotto hub" style="width: 28px; height: 28px; border-radius: 6px;">\n                Lotto hub\n            </h1>'

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # skip index.html as we want to keep its specific styling without the anchor
    if f == 'index.html':
        continue
        
    if '<h1 class="logo">' in content or '<h1 class="logo"><a' in content:
        # Replaces both <h1 class="logo">Lotto hub</h1> and <h1 class="logo"><a href="...">Lotto hub</a></h1>
        content = re.sub(r'<h1 class="logo">.*?Lotto hub.*?</h1>', replacement, content, flags=re.DOTALL)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f'Updated {f}')
