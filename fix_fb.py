import os

community_path = r'c:\Users\s0023\OneDrive\바탕 화면\로또 ai\community.js'
with open(community_path, 'r', encoding='utf-8') as f:
    code = f.read()

if 'localStorage.setItem' in code:
    parts = code.split('        // Save to local storage (filter out auto post so it generates fresh)')
    new_code = parts[0] + """
        try {
            if (currentBase64Image && fdb) {
                submitBtn.textContent = '사진 저장 중...';
                const storageRef = fdb.ref(fdb.storage, `posts/${newPostId}.jpg`);
                await fdb.uploadString(storageRef, currentBase64Image, 'data_url');
                newPost.image = await fdb.getDownloadURL(storageRef);
            }

            submitBtn.textContent = '게시글 등록 중...';
            if (fdb) {
                await fdb.addDoc(fdb.collection(fdb.db, "posts"), newPost);
            }

            titleInput.value = '';
            authorInput.value = '';
            contentInput.value = '';
            if(postImage) postImage.value = '';
            currentBase64Image = null;
            if(imagePreview) imagePreview.style.display = 'none';
            writeSection.classList.add('hidden');
            
            submitBtn.textContent = '등록하기';
            submitBtn.disabled = false;
            
            await renderPosts();
            
        } catch (error) {
            console.error("Upload error:", error);
            alert("업로드 중 오류가 발생했습니다.");
            submitBtn.textContent = '등록하기';
            submitBtn.disabled = false;
        }
    });
"""
    new_code += "\n    setTimeout(() => { renderPosts(); }, 500);\n});\n"
    with open(community_path, 'w', encoding='utf-8') as f:
        f.write(new_code)
    print("community.js fixed")

# Now fix script.js to load preview from FB
script_path = r'c:\Users\s0023\OneDrive\바탕 화면\로또 ai\script.js'
with open(script_path, 'r', encoding='utf-8') as f:
    s_code = f.read()

if 'localStorage.getItem(\'lotto_hub_posts\')' in s_code:
    s_code = s_code.replace("""    // Load community preview
    function loadCommunityPreview() {
        const previewList = document.getElementById('mainCommunityPreview');
        const tickerText = document.getElementById('tickerText');
        if (!previewList) return;

        let posts = [];
        try {
            const saved = localStorage.getItem('lotto_hub_posts');
            if (saved) posts = JSON.parse(saved);
        } catch(e) {}

        if (posts.length === 0) {
            previewList.innerHTML = '<li style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 10px;">아직 등록된 후기가 없습니다.</li>';
            if(tickerText) tickerText.innerHTML = '🔥 첫 당첨 후기의 주인공이 되어보세요!';
            return;
        }

        // ... show top 5
        const topPosts = posts.slice(0, 5);""", """    // Load community preview from Firebase
    async function loadCommunityPreview() {
        const previewList = document.getElementById('mainCommunityPreview');
        const tickerText = document.getElementById('tickerText');
        if (!previewList) return;
        
        let posts = [];
        try {
            const fdb = window.firebaseDB;
            if (fdb) {
                const q = fdb.query(fdb.collection(fdb.db, "posts"), fdb.orderBy("id", "desc"), fdb.limit(5));
                const snap = await fdb.getDocs(q);
                snap.forEach(d => { posts.push(d.data()); });
            }
        } catch(e) { console.error(e); }

        if (posts.length === 0) {
            previewList.innerHTML = '<li style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 10px;">아직 등록된 후기가 없습니다.</li>';
            if(tickerText) tickerText.innerHTML = '🔥 첫 당첨 후기의 주인공이 되어보세요!';
            return;
        }

        const topPosts = posts;""")
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(s_code)
    print("script.js fixed")

# Now fix post.html script
post_path = r'c:\Users\s0023\OneDrive\바탕 화면\로또 ai\post.html'
with open(post_path, 'r', encoding='utf-8') as f:
    p_code = f.read()

if "localStorage.getItem('lotto_hub_posts')" in p_code:
    p_code = p_code.replace("""        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            const postDetail = document.getElementById('postDetail');
            
            if (!postId) {
                postDetail.innerHTML = '<p style="text-align:center; padding: 50px;">잘못된 접근입니다.</p>';
                return;
            }

            let posts = [];
            try {
                const saved = localStorage.getItem('lotto_hub_posts');
                if(saved) posts = JSON.parse(saved);
            } catch(e) {}

            const post = posts.find(p => p.id.toString() === postId);""", """        document.addEventListener('DOMContentLoaded', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            const postDetail = document.getElementById('postDetail');
            
            if (!postId) {
                postDetail.innerHTML = '<p style="text-align:center; padding: 50px;">잘못된 접근입니다.</p>';
                return;
            }

            let post = null;
            let postDocId = null;
            try {
                const fdb = window.firebaseDB;
                if (fdb) {
                    const q = fdb.query(fdb.collection(fdb.db, "posts"), fdb.orderBy("id", "desc"));
                    const snap = await fdb.getDocs(q);
                    snap.forEach(d => { 
                        if(d.data().id.toString() === postId) {
                            post = d.data();
                            postDocId = d.id;
                        }
                    });
                }
            } catch(e) {}""")
            
    p_code = p_code.replace("""                // Delete Logic
                const deleteBtn = document.getElementById('deleteBtn');
                deleteBtn.addEventListener('click', () => {
                    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
                        const newPosts = posts.filter(p => p.id.toString() !== postId);
                        localStorage.setItem('lotto_hub_posts', JSON.stringify(newPosts));
                        alert('게시글이 삭제되었습니다.');
                        window.location.href = 'community.html';
                    }
                });""", """                // Delete Logic from Firebase
                const deleteBtn = document.getElementById('deleteBtn');
                deleteBtn.addEventListener('click', async () => {
                    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
                        const fdb = window.firebaseDB;
                        if(fdb && postDocId) {
                            await fdb.deleteDoc(fdb.doc(fdb.db, "posts", postDocId));
                        }
                        alert('게시글이 삭제되었습니다.');
                        window.location.href = 'community.html';
                    }
                });""")
                
    with open(post_path, 'w', encoding='utf-8') as f:
        f.write(p_code)
    print("post.html fixed")

