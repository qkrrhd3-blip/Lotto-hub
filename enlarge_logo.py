import os
import glob

html_files = glob.glob('*.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Increase logo image size and gap
    content = content.replace('gap: 8px;"', 'gap: 10px;"')
    content = content.replace('width: 28px; height: 28px;', 'width: 36px; height: 36px;')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    
    print(f'Updated logo size in {f}')
