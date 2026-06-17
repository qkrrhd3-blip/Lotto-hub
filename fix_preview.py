import os
path = r'c:\Users\s0023\OneDrive\바탕 화면\로또 ai\script.js'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

target = '''    // 메인 화면 커뮤니티 인기글 렌더링
    function renderCommunityPreview() {
        const previewContainer = document.getElementById('mainCommunityPreview');
        if (!previewContainer) return;
        
        if (window.getCommunityData) {
            const posts = window.getCommunityData();
            // 시스템 공지(auto-) 제외하고 순수 유저 후기만 3개 추출
            const userPosts = posts.filter(p => !p.id.toString().startsWith('auto-')).slice(0, 3);
            
            previewContainer.innerHTML = '';
            userPosts.forEach(post => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="post-title" title="${post.title}">${post.title}</span>
                    <span class="post-author">${post.author}</span>
                `;
                // 클릭 시 커뮤니티로 이동
                li.addEventListener('click', () => {
                    window.location.href = 'community.html';
                });
                previewContainer.appendChild(li);
            });
        }
    }
    renderCommunityPreview();'''

replacement = '''    // 메인 화면 커뮤니티 인기글 렌더링
    async function renderCommunityPreview() {
        const previewContainer = document.getElementById('mainCommunityPreview');
        if (!previewContainer) return;
        
        let posts = [];
        try {
            const fdb = window.firebaseDB;
            if (fdb) {
                const q = fdb.query(fdb.collection(fdb.db, "posts"), fdb.orderBy("id", "desc"), fdb.limit(3));
                const snap = await fdb.getDocs(q);
                snap.forEach(d => { posts.push(d.data()); });
            }
        } catch(e) { console.error(e); }

        previewContainer.innerHTML = '';
        if (posts.length === 0) {
            previewContainer.innerHTML = '<li style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 10px;">아직 등록된 후기가 없습니다.</li>';
            return;
        }

        posts.forEach(post => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="post-title" title="${post.title}">${post.title}</span>
                <span class="post-author">${post.author}</span>
            `;
            // 클릭 시 커뮤니티로 이동
            li.addEventListener('click', () => {
                window.location.href = 'community.html';
            });
            previewContainer.appendChild(li);
        });
    }
    
    // Call it after a short delay so Firebase has time to initialize
    setTimeout(renderCommunityPreview, 1000);'''

if target in code:
    code = code.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    os.system('git add script.js && git commit -m "fix: renderCommunityPreview uses Firebase" && git push')
    print('Fixed successfully')
else:
    print('Target not found')
