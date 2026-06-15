import os
import glob
import re

html_files = glob.glob('*.html')

sidebar_left_replacement = """    <div class="adsense-sidebar left">
        <div class="adsense-placeholder vertical" id="googleAdLeft">구글 자동 광고 (좌)</div>
        <div id="customAdLeftSlot" class="custom-ad-container">수동 커스텀 광고 영역 (좌)</div>
    </div>"""

sidebar_right_replacement = """    <div class="adsense-sidebar right">
        <div class="adsense-placeholder vertical" id="googleAdRight">구글 자동 광고 (우)</div>
        <div id="customAdRightSlot" class="custom-ad-container">수동 커스텀 광고 영역 (우)</div>
    </div>"""

for f in html_files:
    if f == 'admin.html': # We will create this later, but just in case
        continue
        
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We want to replace the current sidebars
    # Left sidebar pattern
    left_pattern = r'<div class="adsense-sidebar left">.*?</div>\s*</div>'
    if re.search(left_pattern, content, flags=re.DOTALL):
        content = re.sub(left_pattern, sidebar_left_replacement, content, flags=re.DOTALL)
    
    # Right sidebar pattern
    right_pattern = r'<div class="adsense-sidebar right">.*?</div>\s*</div>'
    if re.search(right_pattern, content, flags=re.DOTALL):
        content = re.sub(right_pattern, sidebar_right_replacement, content, flags=re.DOTALL)
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        
    print(f'Patched sidebars in {f}')
