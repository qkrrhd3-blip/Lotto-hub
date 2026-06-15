import glob
import re

html_files = glob.glob('article-*.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Extract the tag for hashtag if possible, else default
    tag_match = re.search(r'<span class="article-tag">(.*?)</span>', content)
    article_tag = tag_match.group(1) if tag_match else "분석"
    
    # Check if already has hashtags
    if 'class="article-hashtags"' not in content:
        hashtags_html = f"""
                <div class="article-hashtags" style="margin-top: 50px; padding-top: 20px; border-top: 1px dashed var(--border-color); display: flex; gap: 10px; flex-wrap: wrap;">
                    <span style="background: #f1f5f9; color: var(--primary-color); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">#로또</span>
                    <span style="background: #f1f5f9; color: var(--primary-color); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">#당첨번호</span>
                    <span style="background: #f1f5f9; color: var(--primary-color); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">#{article_tag}</span>
                    <span style="background: #f1f5f9; color: var(--primary-color); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">#통계분석</span>
                    <span style="background: #f1f5f9; color: var(--primary-color); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">#인공지능</span>
                </div>
            </div>
        </section>"""
        
        # Replace the closing tags with the hashtag block
        content = re.sub(r'\s*</div>\s*</section>', hashtags_html, content)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Injected hashtags into {f}")
    else:
        print(f"Hashtags already exist in {f}")
