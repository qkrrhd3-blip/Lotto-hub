document.addEventListener('DOMContentLoaded', () => {
    const writeBtn = document.getElementById('writeBtn');
    const writeSection = document.getElementById('writeSection');
    const cancelBtn = document.getElementById('cancelBtn');
    const submitBtn = document.getElementById('submitBtn');
    const boardBody = document.getElementById('boardBody');

    const titleInput = document.getElementById('postTitle');
    const authorInput = document.getElementById('postAuthor');
    const contentInput = document.getElementById('postContent');

    // 새 이미지 업로드 관련
    const postImage = document.getElementById('postImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImageBtn');
    let currentBase64Image = null;

    if (postImage) {
        postImage.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 800;
                    
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    currentBase64Image = canvas.toDataURL('image/jpeg', 0.6); // Compress to 60% quality
                    
                    previewImg.src = currentBase64Image;
                    imagePreview.style.display = 'block';
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            postImage.value = '';
            currentBase64Image = null;
            imagePreview.style.display = 'none';
        });
    }


    // Firebase instance

    let posts = [];

    // Modal elements
    const postModal = document.getElementById('postModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalAuthor = document.getElementById('modalAuthor');
    const modalDate = document.getElementById('modalDate');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.querySelector('.close-modal');

    // Load DB for auto post
    async function loadAutoPost() {
        try {
            const response = await fetch('https://smok95.github.io/lotto/results/all.json');
            const data = await response.json();
            if(!data || data.length === 0) return;
            
            const latest = data[data.length - 1];
            const drawNo = latest.draw_no;
            const date = latest.date.split('T')[0];
            const nums = latest.numbers;
            const bonus = latest.bonus_no;
            
            // Calculate stats
            let highCount = nums.filter(n => n >= 23).length;
            let lowCount = nums.filter(n => n <= 22).length;
            let oddCount = nums.filter(n => n % 2 !== 0).length;
            let evenCount = nums.filter(n => n % 2 === 0).length;
            let sum = nums.reduce((a, b) => a + b, 0);
            
            // Dynamic SEO Titles based on drawNo (deterministic)
            const titleTemplates = [
                `제 ${drawNo}회 로또 당첨번호: 홀짝 및 고저 비율 완벽 분석`,
                `[통계] ${drawNo}회차 로또 1등 결과 요약 및 패턴 정밀 분석`,
                `로또 ${drawNo}회 당첨금 안내 및 1등 번호 출현 특징 분석`,
                `제 ${drawNo}회 로또 분석 리포트 (특이점 및 번호 총합 통계)`,
                `이번 주 로또 ${drawNo}회차 1등 당첨번호 심층 통계 리뷰`
            ];
            const autoTitle = titleTemplates[drawNo % titleTemplates.length];
            
            // SEO HTML Content
            const autoContent = `
                <h3>제 ${drawNo}회 로또 당첨번호 안내</h3>
                <p>이번 주 제 ${drawNo}회 로또 1등 당첨번호는 <strong>${nums.join(', ')}</strong> 이며, 보너스 번호는 <strong>${bonus}</strong> 입니다.</p>
                <p>총 1등 당첨금액은 <strong>${latest.firstAccumamnt.toLocaleString()}원</strong>이며, 당첨자 수는 <strong>${latest.firstPrzwnerCo}명</strong>으로 1인당 <strong>${latest.firstWinamnt.toLocaleString()}원</strong>을 수령하게 됩니다.</p>
                
                <h3>당첨번호 정밀 통계 분석</h3>
                <ul>
                    <li><strong>고저 비율 (23 기준)</strong>: 고(High) ${highCount} : 저(Low) ${lowCount}</li>
                    <li><strong>홀짝 비율</strong>: 홀수 ${oddCount} : 짝수 ${evenCount}</li>
                    <li><strong>번호 총합</strong>: ${sum}</li>
                </ul>
                
                <h3>번호대별 출현 현황</h3>
                <p>이러한 각 구간별 쏠림 현상을 분석하여 다음 회차 핫/콜드 넘버 예측에 활용할 수 있습니다. 당첨 번호의 구체적인 연속성 및 패턴 분석은 메인 화면의 분석기를 통해 직접 경험해 보실 수 있습니다.</p>
                
                <p style="margin-top:40px; color:#718096; font-size:0.9rem;"><em>* 본 분석 리포트는 최신 추첨 데이터를 바탕으로 실시간 자동 작성된 문서입니다.</em></p>
            `;

            // Check if already in posts array (we persist this one in memory/localstorage if needed, but easier to just check and inject on load)
            const existsIndex = posts.findIndex(p => p.title === autoTitle);
            const autoPostObj = {
                id: 'auto-' + drawNo,
                title: autoTitle,
                author: '시스템 관리자',
                date: date.replace(/-/g, '.'),
                content: autoContent,
                isHtml: true
            };

            if(existsIndex === -1) {
                // Remove older auto posts to keep list clean (optional, but good for focus)
                posts = posts.filter(p => !p.id.toString().startsWith('auto-'));
                posts.unshift(autoPostObj);
            } else {
                // Update existing
                posts[existsIndex] = autoPostObj;
            }
            renderPosts();
        } catch(e) {
            console.error('자동 분석글 로드 실패', e);
        }
    }

    function openModal(postIndex) {
        const post = posts[postIndex];
        modalTitle.textContent = post.title;
        modalAuthor.textContent = post.author;
        modalDate.textContent = post.date;
        
        if(post.isHtml) {
            modalBody.innerHTML = post.content;
        } else {
            modalBody.textContent = post.content;
            // Add basic formatting for plain text
            modalBody.innerHTML = modalBody.innerHTML.replace(/\\n/g, '<br>');
        }
        
        postModal.classList.remove('hidden');
    }

    if(closeModal) {
        closeModal.addEventListener('click', () => {
            postModal.classList.add('hidden');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === postModal) {
            postModal.classList.add('hidden');
        }
    });

    // Load posts from Firebase
    async function renderPosts() {
        boardBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px;">서버에서 데이터를 불러오는 중...</td></tr>';
        
        let dbPosts = [];
        try {
            const fdb = window.firebaseDB; if (fdb) {
                const q = fdb.query(fdb.collection(fdb.db, "posts"), fdb.orderBy("id", "desc"));
                const querySnapshot = await fdb.getDocs(q);
                querySnapshot.forEach((doc) => {
                    let d = doc.data();
                    d.docId = doc.id;
                    dbPosts.push(d);
                });
            }
        } catch (e) {
            console.error("Firebase load error:", e);
        }

        // Add auto post back to front if exists in local 'posts' array
        const autoPost = posts.find(p => p.id.toString().startsWith('auto-'));
        if (autoPost) {
            dbPosts.unshift(autoPost);
        }
        posts = dbPosts; // Sync local state

        boardBody.innerHTML = '';
        if (posts.length === 0) {
            boardBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px;">등록된 게시글이 없습니다.</td></tr>';
            return;
        }

        posts.forEach((post, index) => {
            const tr = document.createElement('tr');
            // ID column: if auto post, show '공지'
            const displayId = post.id.toString().startsWith('auto-') ? '<span style="color:var(--primary-color);font-weight:bold;">[분석]</span>' : (posts.length - index);
            
            let titleHtml = post.title;
            if (post.image) {
                titleHtml += ` <span style="font-size:0.85rem; margin-left:5px;" title="사진 첨부됨">📷</span>`;
            }
            
            let postLink = `post.html?id=${post.id}`;
            if (post.id.toString().startsWith('auto-')) {
                const drawNumber = post.id.replace('auto-', '');
                postLink = `post-${drawNumber}.html`;
            }
            
            tr.innerHTML = `
                <td>${displayId}</td>
                <td class="title-col"><a href="${postLink}" class="post-link">${titleHtml}</a></td>
                <td>${post.author}</td>
                <td>${post.date}</td>
            `;
            boardBody.appendChild(tr);
        });

        // Add event listeners to links (Optional now since href is directly applied, but good for custom logic if needed)
    }

    // Toggle Write Form
    writeBtn.addEventListener('click', () => {
        const currentUser = JSON.parse(localStorage.getItem('lotto_hub_current_user'));
        if (!currentUser) {
            alert('로그인 후 이용 가능합니다. 먼저 로그인해 주세요.');
            window.location.href = 'login.html';
            return;
        }

        writeSection.classList.remove('hidden');
        authorInput.value = currentUser.email.split('@')[0];
        authorInput.readOnly = true;
        titleInput.focus();
    });

    cancelBtn.addEventListener('click', () => {
        writeSection.classList.add('hidden');
        titleInput.value = '';
        authorInput.value = '';
        contentInput.value = '';
        if(postImage) postImage.value = '';
        currentBase64Image = null;
        if(imagePreview) imagePreview.style.display = 'none';
    });

    // Submit Post
    submitBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const content = contentInput.value.trim();

        if(!title || !author || !content) {
            alert('모든 항목을 입력해 주세요.');
            return;
        }

        submitBtn.textContent = '업로드 중...';
        submitBtn.disabled = true;

        const today = new Date();
        const dateString = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
        const newPostId = Date.now();

        const newPost = {
            id: newPostId,
            title: title,
            author: author,
            date: dateString,
            content: content,
            image: null
        };


        try {
            const fdb = window.firebaseDB; if (currentBase64Image && fdb) {
                submitBtn.textContent = '사진 저장 중...';
                const storageRef = fdb.ref(fdb.storage, `posts/${newPostId}.jpg`);
                await fdb.uploadString(storageRef, currentBase64Image, 'data_url');
                newPost.image = await fdb.getDownloadURL(storageRef);
            }

            submitBtn.textContent = '게시글 등록 중...';
            const fdb = window.firebaseDB; if (fdb) {
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

    setTimeout(() => { renderPosts(); }, 500);
});
