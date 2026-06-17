import { } from "./db.js";

// DOM Elements
const userEmailDisplay = document.getElementById('userEmailDisplay');
const savedCount = document.getElementById('savedCount');
const savedGamesContainer = document.getElementById('savedGamesContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

// Auth Check
const currentUser = JSON.parse(localStorage.getItem('lotto_hub_current_user'));
if (!currentUser) {
    alert('로그인이 필요한 페이지입니다.');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    userEmailDisplay.textContent = currentUser.email;

    // 회원 탈퇴
    deleteAccountBtn.addEventListener('click', async () => {
        if(confirm('정말 회원 탈퇴를 진행하시겠습니까?\n파이어베이스에 저장된 회원님의 모든 개인정보와 로또 번호 내역이 즉시 파기되며 복구할 수 없습니다.')) {
            try {
                // Delete user's saved numbers from Firestore
                const { db, collection, query, where, getDocs, deleteDoc } = window.firebaseDB;
                const q = query(collection(db, "saved_numbers"), where("email", "==", currentUser.email));
                const querySnapshot = await getDocs(q);
                
                const deletePromises = [];
                querySnapshot.forEach((docSnap) => {
                    deletePromises.push(deleteDoc(docSnap.ref));
                });
                await Promise.all(deletePromises);

                // LocalStorage user deletion
                const users = JSON.parse(localStorage.getItem('lotto_hub_users')) || [];
                const filteredUsers = users.filter(u => u.email !== currentUser.email);
                localStorage.setItem('lotto_hub_users', JSON.stringify(filteredUsers));
                
                localStorage.removeItem('lotto_hub_current_user');
                alert('회원 탈퇴 처리가 완료되었으며 모든 정보가 파기되었습니다.\n그동안 이용해 주셔서 감사합니다.');
                window.location.href = 'index.html';
            } catch (error) {
                console.error("탈퇴 중 오류 발생:", error);
                alert("탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        }
    });

    await loadSavedGames();
});

// 당첨 번호 캐싱
const winningNumbersCache = {};

async function getWinningNumbers(drawNo) {
    if (winningNumbersCache[drawNo]) return winningNumbersCache[drawNo];
    
    try {
        // 동행복권 API (CORS 프록시 사용)
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const targetUrl = encodeURIComponent(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drawNo}`);
        
        const response = await fetch(proxyUrl + targetUrl);
        const data = await response.json();
        const lottoData = JSON.parse(data.contents);

        if (lottoData.returnValue === 'success') {
            const winNums = [
                lottoData.drwtNo1, lottoData.drwtNo2, lottoData.drwtNo3, 
                lottoData.drwtNo4, lottoData.drwtNo5, lottoData.drwtNo6
            ];
            winningNumbersCache[drawNo] = {
                numbers: winNums,
                bonus: lottoData.bnusNo,
                date: lottoData.drwNoDate
            };
            return winningNumbersCache[drawNo];
        } else {
            // 미래 회차이거나 결과 없음
            winningNumbersCache[drawNo] = null;
            return null;
        }
    } catch (e) {
        console.error('당첨 번호 조회 실패:', e);
        return null;
    }
}

function getColorClass(num) {
    if(num <= 10) return 'color-yellow';
    if(num <= 20) return 'color-blue';
    if(num <= 30) return 'color-red';
    if(num <= 40) return 'color-gray';
    return 'color-green';
}

function checkWinning(myNumbers, winData) {
    if (!winData) return { rank: 0, html: '<span class="win-badge win-wait">추첨 대기중 ⏳</span>' };
    
    let matchCount = 0;
    myNumbers.forEach(n => {
        if (winData.numbers.includes(n)) matchCount++;
    });
    
    const hasBonus = myNumbers.includes(winData.bonus);

    if (matchCount === 6) return { rank: 1, html: '<span class="win-badge win-1">🎉 1등 당첨!!</span>' };
    if (matchCount === 5 && hasBonus) return { rank: 2, html: '<span class="win-badge win-2">🎊 2등 당첨!</span>' };
    if (matchCount === 5) return { rank: 3, html: '<span class="win-badge win-3">🎯 3등 당첨</span>' };
    if (matchCount === 4) return { rank: 4, html: '<span class="win-badge win-4">✨ 4등 당첨</span>' };
    if (matchCount === 3) return { rank: 5, html: '<span class="win-badge win-5">👍 5등 당첨</span>' };
    
    return { rank: 6, html: '<span class="win-badge win-none">낙첨</span>' };
}

async function loadSavedGames() {
    try {
        const { db, collection, query, where, orderBy, getDocs } = window.firebaseDB;
        
        // Firestore 쿼리 (인덱스 필요 가능성 - 만약 에러시 orderBy 뺄 것)
        const q = query(
            collection(db, "saved_numbers"), 
            where("email", "==", currentUser.email),
            orderBy("timestamp", "desc")
        );
        
        let querySnapshot;
        try {
            querySnapshot = await getDocs(q);
        } catch (idxError) {
            console.warn("Firestore index missing, falling back to client sort", idxError);
            const qFallback = query(collection(db, "saved_numbers"), where("email", "==", currentUser.email));
            querySnapshot = await getDocs(qFallback);
        }

        loadingIndicator.style.display = 'none';

        const docs = [];
        querySnapshot.forEach(doc => {
            docs.push({ id: doc.id, ...doc.data() });
        });

        // 클라이언트 정렬 (fallback)
        docs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        savedCount.textContent = `(${docs.length}건)`;

        if (docs.length === 0) {
            savedGamesContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color);">
                    <p style="color: var(--text-muted); font-size: 1.05rem;">아직 저장된 로또 번호가 없습니다.</p>
                    <a href="index.html" class="btn primary" style="display: inline-block; margin-top: 15px;">번호 생성하러 가기</a>
                </div>
            `;
            return;
        }

        savedGamesContainer.innerHTML = '';

        const tabsContainer = document.createElement('div');
        tabsContainer.style.display = 'flex';
        tabsContainer.style.flexWrap = 'wrap';
        tabsContainer.style.gap = '8px';
        tabsContainer.style.marginBottom = '20px';
        
        const cardsContainer = document.createElement('div');
        
        savedGamesContainer.appendChild(tabsContainer);
        savedGamesContainer.appendChild(cardsContainer);

        let recordIndex = docs.length;
        const tabs = [];
        const cards = [];

        for (const record of docs) {
            const currentIdx = recordIndex--;
            const drawNo = record.drawNo;
            const dateStr = new Date(record.timestamp).toLocaleDateString('ko-KR');
            
            // 탭 버튼 생성
            const tab = document.createElement('button');
            tab.textContent = `${currentIdx}번 저장건`;
            tab.style.padding = '6px 12px';
            tab.style.borderRadius = '20px';
            tab.style.border = '2px solid var(--primary-color)';
            tab.style.background = 'transparent';
            tab.style.color = 'var(--text-main)';
            tab.style.cursor = 'pointer';
            tab.style.fontWeight = '600';
            tab.style.transition = 'all 0.2s ease';
            
            // 카드 내용 생성
            const card = document.createElement('div');
            card.className = 'saved-game-card';
            card.style.display = 'none';
            
            // 당첨 결과 가져오기
            const winData = await getWinningNumbers(drawNo);
            
            let gamesHtml = '';
            record.games.forEach((gameObj, idx) => {
                // 이전에 중첩 배열로 저장된 데이터가 있다면 배열 자체로, 새 데이터는 gameObj.numbers로
                const gameNums = Array.isArray(gameObj) ? gameObj : gameObj.numbers;
                const winResult = checkWinning(gameNums, winData);
                
                let ballsHtml = '';
                gameNums.forEach(num => {
                    // 당첨 번호에 포함되면 빛나게 처리
                    const isWinNum = winData && winData.numbers.includes(num);
                    const isBonus = winData && winData.bonus === num;
                    const highlightStyle = isWinNum ? 'box-shadow: 0 0 10px yellow; border: 2px solid gold;' : (isBonus ? 'box-shadow: 0 0 10px red; border: 2px solid red;' : '');
                    
                    ballsHtml += `<div class="ball ${getColorClass(num)}" style="width: 32px; height: 32px; font-size: 0.85rem; ${highlightStyle}">${num}</div>`;
                });

                gamesHtml += `
                    <div class="game-row" style="margin-bottom: 10px;">
                        <div class="game-label" style="width: 50px; font-size: 0.9rem;">${idx+1}게임</div>
                        <div class="lotto-balls" style="gap: 5px;">
                            ${ballsHtml}
                        </div>
                        ${winResult.html}
                    </div>
                `;
            });

            const realWinHtml = winData ? `<div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-bottom: 15px; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 8px;">이번 주 실제 당첨 번호: <strong style="color:var(--primary-color)">${winData.numbers.join(', ')} + ${winData.bonus}</strong></div>` : '';

            card.innerHTML = `
                <div class="saved-game-header">
                    <span class="draw-badge">제 ${drawNo}회 추첨</span>
                    <span style="color: var(--text-muted); font-size: 0.85rem;">저장일시: ${dateStr}</span>
                </div>
                ${realWinHtml}
                <div class="saved-games-list">
                    ${gamesHtml}
                </div>
            `;
            
            // 탭 클릭 이벤트
            tab.addEventListener('click', () => {
                tabs.forEach(t => { 
                    t.style.background = 'transparent'; 
                    t.style.color = 'var(--text-main)'; 
                });
                cards.forEach(c => c.style.display = 'none');
                
                tab.style.background = 'var(--primary-color)';
                tab.style.color = 'white';
                card.style.display = 'block';
            });

            tabsContainer.appendChild(tab);
            cardsContainer.appendChild(card);
            
            tabs.push(tab);
            cards.push(card);
        }
        
        // 첫 번째 탭(가장 최근) 자동 클릭
        if (tabs.length > 0) {
            tabs[0].click();
        }

    } catch (e) {
        console.error(e);
        loadingIndicator.innerHTML = '<span style="color: #ef4444;">데이터를 불러오는 중 오류가 발생했습니다.</span>';
    }
}
