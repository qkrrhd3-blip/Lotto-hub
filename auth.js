// 20개의 생생한 기본 후기 데이터 초기화 및 제공 함수 (전역)
window.getCommunityData = function() {
    let posts = JSON.parse(localStorage.getItem('lotto_hub_posts'));
    if (!posts || posts.length < 20 || !localStorage.getItem('lotto_hub_seeded_v3')) {
        posts = [
            { id: 20, title: "로또 허브 덕분에 3등 당첨됐습니다 ㅠㅠ", author: "대박기원99", date: "2026.06.12", content: "진짜 거짓말 안 하고 AI 분석으로 나온 번호 샀는데 3등 맞았습니다. 감사합니다 운영자님!" },
            { id: 19, title: "이번 주 추천 번호 대박 예감입니다", author: "행운가득", date: "2026.06.12", content: "생성기로 돌린 번호 느낌이 너무 좋네요. 1등 가즈아!" },
            { id: 18, title: "핫넘버 분석 소름돋네요", author: "분석가K", date: "2026.06.11", content: "저번주 뜨거운 번호 3개나 적중했네요. 여기서 계속 해봅니다." },
            { id: 17, title: "가입인사 드립니다~", author: "로또초보", date: "2026.06.11", content: "지인 추천으로 왔는데 UI가 엄청 깔끔하네요. 잘 쓰겠습니다!" },
            { id: 16, title: "사주 맞춤 번호 은근 잘 맞아요", author: "토정비결", date: "2026.06.11", content: "생년월일 넣고 돌렸더니 지난주 4등 하나 건졌습니다ㅎㅎ" },
            { id: 15, title: "이 사이트 진짜 꿀단지네요", author: "나만알고싶다", date: "2026.06.09", content: "유료 사이트들보다 백배 낫습니다. 무료로 이런 퀄리티라니.." },
            { id: 14, title: "오늘도 5게임 돌리고 왔습니다", author: "직장인A", date: "2026.06.09", content: "매주 금요일 퇴근길에 여기서 번호 뽑아서 사는게 낙이네요." },
            { id: 13, title: "홀짝 비율 필터링 최고입니다", author: "통계빌런", date: "2026.06.08", content: "무지성으로 사는 것보다 통계적으로 걸러주니까 훨씬 확률이 높은 것 같습니다." },
            { id: 12, title: "아쉽게 번호 하나 차이로 1등 놓쳤네요ㅠㅠ", author: "눈물주룩", date: "2026.06.07", content: "너무 아쉽지만 그래도 희망을 봤습니다. 다음 주 다시 도전!" },
            { id: 11, title: "로또 분석 칼럼 잘 읽고 있습니다", author: "학구파", date: "2026.06.06", content: "데이터 분석글 보면서 많이 배웁니다. 좋은 정보 감사해요." },
            { id: 10, title: "모바일 앱으로 나오면 좋겠어요", author: "스마트폰중독", date: "2026.06.05", content: "홈 화면에 추가해서 쓰니까 편하긴 한데 정식 앱도 기대해봅니다!" },
            { id: 9, title: "5등 3개 당첨 인증!", author: "소소한행복", date: "2026.06.05", content: "본전은 뽑았네요ㅋㅋ 치킨 시켜먹겠습니다." },
            { id: 8, title: "저도 1등 당첨 후기 쓰는 날이 오길", author: "간절함", date: "2026.06.04", content: "매주 만원씩 소소하게 하고 있습니다. 다들 화이팅!" },
            { id: 7, title: "로또 생성기 속도가 엄청 빠르네요", author: "스피드광", date: "2026.06.04", content: "다른 곳은 한참 걸리던데 여긴 누르자마자 쫙 나오네요. 굿" },
            { id: 6, title: "콜드 넘버 전략이 유효하네요", author: "역발상", date: "2026.06.02", content: "안나오던 번호들 위주로 조합했더니 성적이 꽤 좋습니다." },
            { id: 5, title: "회원가입 완료!", author: "뉴비인사", date: "2026.06.01", content: "앞으로 자주 오겠습니다. 잘 부탁드려요~" },
            { id: 4, title: "지인들에게도 다 추천했습니다", author: "동네이장", date: "2026.06.01", content: "좋은 건 나눠야죠! 단톡방에 다 공유했습니다." },
            { id: 3, title: "자동보다 성적이 훨씬 낫네요", author: "수동매니아", date: "2026.05.29", content: "매번 꽝이었는데 여기서 반자동으로 하니까 당첨률이 올라갑니다." },
            { id: 2, title: "당첨금 정밀 통계 볼 수 있어서 짱", author: "숫자광", date: "2026.05.28", content: "회차별로 한눈에 볼 수 있어서 분석하기 참 편하네요." },
            { id: 1, title: "로또 허브 대박 나시길 응원합니다", author: "초기멤버", date: "2026.05.28", content: "초창기부터 썼는데 점점 발전하는 모습 보기 좋습니다." }
        ];
        localStorage.setItem('lotto_hub_posts', JSON.stringify(posts));
        localStorage.setItem('lotto_hub_seeded_v3', 'true');
    }
    return posts;
};

document.addEventListener('DOMContentLoaded', () => {

    // UI Elements that might need updating based on auth state
    const authNavContainer = document.getElementById('authNavContainer');
    
    // Check current logged in user
    const currentUser = JSON.parse(localStorage.getItem('lotto_hub_current_user'));

    // Update Navigation UI
    if (authNavContainer) {
        if (currentUser) {
            authNavContainer.innerHTML = `
                <a href="mypage.html" class="nav-btn" style="color: var(--primary-color); font-weight: bold;">마이페이지</a>
                <span style="color: var(--text-muted); margin-right: 15px; margin-left: 15px; font-size: 0.9rem;">${currentUser.email}님</span>
                <a href="#" id="logoutBtn" class="nav-btn" style="border: 1px solid var(--border-color);">로그아웃</a>
            `;

            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('lotto_hub_current_user');
                window.location.reload();
            });
        } else {
            authNavContainer.innerHTML = `
                <a href="login.html" class="nav-btn primary">로그인 / 회원가입</a>
            `;
        }
    }

    // Login Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            const users = JSON.parse(localStorage.getItem('lotto_hub_users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('lotto_hub_current_user', JSON.stringify({ email: user.email }));
                window.location.href = 'index.html';
            } else {
                alert('이메일 또는 비밀번호가 일치하지 않습니다.');
            }
        });

        // Forgot Password Logic
        const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const emailInput = prompt('가입하신 이메일 주소를 입력해 주세요.');
                if (emailInput) {
                    const users = JSON.parse(localStorage.getItem('lotto_hub_users')) || [];
                    const foundUser = users.find(u => u.email === emailInput.trim());
                    if (foundUser) {
                        alert(`회원님의 비밀번호는 [ ${foundUser.password} ] 입니다.\n확인 후 다시 로그인해 주세요.`);
                    } else {
                        alert('해당 이메일로 가입된 계정을 찾을 수 없습니다.');
                    }
                }
            });
        }
    }

    // Signup Logic
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

            if (password !== passwordConfirm) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }

            const users = JSON.parse(localStorage.getItem('lotto_hub_users')) || [];
            
            if (users.find(u => u.email === email)) {
                alert('이미 가입된 이메일입니다.');
                return;
            }

            users.push({ email, password });
            localStorage.setItem('lotto_hub_users', JSON.stringify(users));
            
            // Auto login after signup
            localStorage.setItem('lotto_hub_current_user', JSON.stringify({ email }));
            alert('회원가입이 완료되었습니다!');
            window.location.href = 'index.html';
        });
    }

    // --- 수동 광고 영역 로드 및 Fallback 로직 ---
    const customAdLeftCode = localStorage.getItem('lotto_hub_custom_ad_left');
    const customAdRightCode = localStorage.getItem('lotto_hub_custom_ad_right');

    const leftSlot = document.getElementById('customAdLeftSlot');
    if (leftSlot) {
        if (customAdLeftCode && customAdLeftCode.trim() !== '') {
            leftSlot.innerHTML = customAdLeftCode;
            leftSlot.classList.add('filled');
        } else {
            // 수동 광고가 없을 경우 구글 광고(Fallback) 렌더링
            leftSlot.innerHTML = '구글 자동 광고 (좌측 하단)';
            leftSlot.classList.remove('filled');
        }
    }

    const rightSlot = document.getElementById('customAdRightSlot');
    if (rightSlot) {
        if (customAdRightCode && customAdRightCode.trim() !== '') {
            rightSlot.innerHTML = customAdRightCode;
            rightSlot.classList.add('filled');
        } else {
            // 수동 광고가 없을 경우 구글 광고(Fallback) 렌더링
            rightSlot.innerHTML = '구글 자동 광고 (우측 하단)';
            rightSlot.classList.remove('filled');
        }
    }

    // --- 관리자 팝업(모달) 로직 ---
    const footerContainer = document.querySelector('.footer .container');
    if (footerContainer) {
        // 푸터 오른쪽 끝에 관리자 버튼 생성
        const adminBtnContainer = document.createElement('div');
        adminBtnContainer.style.textAlign = 'right';
        adminBtnContainer.style.marginTop = '15px';
        adminBtnContainer.innerHTML = `<a href="#" id="openAdminModalBtn" style="color: var(--border-color); text-decoration: none; font-size: 0.8rem; cursor: pointer;">⚙️ 시스템 관리</a>`;
        footerContainer.appendChild(adminBtnContainer);

        document.getElementById('openAdminModalBtn').addEventListener('click', (e) => {
            e.preventDefault();
            const pwd = prompt('관리자 비밀번호를 입력하세요:');
            if (pwd === '0812') {
                showAdminModal();
            } else if (pwd !== null) {
                alert('비밀번호가 일치하지 않습니다.');
            }
        });
    }

    function showAdminModal() {
        if (document.getElementById('adminModalOverlay')) {
            document.getElementById('adminModalOverlay').style.display = 'flex';
            return;
        }

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'adminModalOverlay';
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modalOverlay.style.zIndex = '9999';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.alignItems = 'center';

        const modalContent = document.createElement('div');
        modalContent.style.background = '#fff';
        modalContent.style.padding = '30px';
        modalContent.style.borderRadius = '12px';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '600px';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';

        const savedLeft = localStorage.getItem('lotto_hub_custom_ad_left') || '';
        const savedRight = localStorage.getItem('lotto_hub_custom_ad_right') || '';

        modalContent.innerHTML = `
            <h2 style="margin-bottom: 20px; color: var(--text-main); text-align: center;">⚙️ 홈페이지 관리자 모달</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
                사이드바 하단에 삽입할 커스텀 광고(배너) HTML/스크립트를 입력하세요. 비워두면 기본 구글 광고가 송출됩니다.
            </p>
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">⬅️ 좌측 하단 광고 코드</label>
                <textarea id="modalAdLeft" style="width: 100%; height: 100px; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px;">${savedLeft}</textarea>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">➡️ 우측 하단 광고 코드</label>
                <textarea id="modalAdRight" style="width: 100%; height: 100px; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px;">${savedRight}</textarea>
            </div>
            <div style="text-align: center;">
                <button id="modalBtnSave" style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-right: 10px;">저장 및 적용</button>
                <button id="modalBtnReset" style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-right: 10px;">모두 비우기</button>
                <button id="modalBtnClose" style="background: #e2e8f0; color: var(--text-main); border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">닫기</button>
            </div>
        `;

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        document.getElementById('modalBtnClose').addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });

        document.getElementById('modalBtnSave').addEventListener('click', () => {
            const leftVal = document.getElementById('modalAdLeft').value;
            const rightVal = document.getElementById('modalAdRight').value;
            localStorage.setItem('lotto_hub_custom_ad_left', leftVal);
            localStorage.setItem('lotto_hub_custom_ad_right', rightVal);
            alert('설정이 저장되었습니다. 페이지가 새로고침됩니다.');
            window.location.reload();
        });

        document.getElementById('modalBtnReset').addEventListener('click', () => {
            if (confirm('수동 광고 코드를 초기화하시겠습니까?')) {
                document.getElementById('modalAdLeft').value = '';
                document.getElementById('modalAdRight').value = '';
                localStorage.removeItem('lotto_hub_custom_ad_left');
                localStorage.removeItem('lotto_hub_custom_ad_right');
                alert('초기화되었습니다. 페이지가 새로고침됩니다.');
                window.location.reload();
            }
        });
    }
});
