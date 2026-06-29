import os, glob

search_str = '''<a href="privacy.html">개인정보처리방침</a>
            </div>'''

replace_str = '''<a href="privacy.html">개인정보처리방침</a>
                <span class="divider">|</span>
                <a href="contact.html">문의하기</a>
            </div>'''

search_str2 = '''<a href="privacy.html">개인정보처리방침</a>\n            </div>'''
replace_str2 = '''<a href="privacy.html">개인정보처리방침</a>\n                <span class="divider">|</span>\n                <a href="contact.html">문의하기</a>\n            </div>'''


files = glob.glob('*.html')
count = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if search_str in content:
        content = content.replace(search_str, replace_str)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        count += 1
    elif search_str2 in content:
        content = content.replace(search_str2, replace_str2)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        count += 1

print(f'Updated {count} files.')
