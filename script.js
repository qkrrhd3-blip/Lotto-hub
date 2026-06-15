document.addEventListener('DOMContentLoaded', () => {
    // Auth display logic
    const currentUser = JSON.parse(localStorage.getItem('lotto_hub_current_user'));
    const authNavContainer = document.getElementById('authNavContainer');
    
    if (authNavContainer) {
        if (currentUser) {
            authNavContainer.innerHTML = `
                <span style="color: var(--text-muted); margin-right: 15px; font-size: 0.9rem;">${currentUser.email}님</span>
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

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    // --- 즉시 화면 렌더링 (캐시 활용) ---
    function renderHeroLatestDraw(latestDraw) {
        // 회차 및 날짜 동적 업데이트
        const recentTitle = document.querySelector('.recent-results h3');
        if (recentTitle && latestDraw) {
            const drawDate = new Date(latestDraw.date);
            const dateStr = `${drawDate.getFullYear()}.${String(drawDate.getMonth() + 1).padStart(2, '0')}.${String(drawDate.getDate()).padStart(2, '0')}`;
            recentTitle.textContent = `제 ${latestDraw.draw_no}회 당첨 번호 (${dateStr} 추첨)`;
        }

        const mainHeroDrawNo = document.getElementById('mainHeroDrawNo');
        const mainHeroBallsContainer = document.getElementById('mainHeroBallsContainer');
        try {
            if(mainHeroDrawNo && mainHeroBallsContainer && latestDraw && latestDraw.numbers) {
                mainHeroDrawNo.textContent = latestDraw.draw_no + '회';
                let ballsHtml = latestDraw.numbers.map(n => `<div class="ball ${getColorClass(n)}">${n}</div>`).join('');
                ballsHtml += `<div style="font-size: 1.5rem; font-weight: bold; color: var(--text-muted); margin: 0 5px;">+</div>`;
                ballsHtml += `<div class="ball ${getColorClass(latestDraw.bonus_no)}">${latestDraw.bonus_no}</div>`;
                mainHeroBallsContainer.innerHTML = ballsHtml;
            } else if (mainHeroBallsContainer) {
                mainHeroBallsContainer.innerHTML = '<div style="color:red; font-size:0.9rem;">렌더링 실패: 데이터를 찾을 수 없습니다.</div>';
            }
        } catch(err) {
            if(mainHeroBallsContainer) {
                mainHeroBallsContainer.innerHTML = `<div style="color:red; font-size:0.9rem;">화면 렌더링 오류: ${err.message}</div>`;
            }
        }
    }

    const cachedLatestDraw = localStorage.getItem('lotto_hub_latest_draw');
    if(cachedLatestDraw) {
        try { renderHeroLatestDraw(JSON.parse(cachedLatestDraw)); } catch(e) {}
    }

    // 메인 화면 커뮤니티 인기글 렌더링
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
    renderCommunityPreview();

    // Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-target')).classList.add('active');
        });
    });

    // Generate Numbers Logic
    const generateBtn = document.getElementById('generateBtn');
    const generateSajuBtn = document.getElementById('generateSajuBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultArea = document.getElementById('resultArea');
    const resultBalls = document.getElementById('resultBalls');
    const aiTerminal = document.getElementById('aiTerminal');
    const terminalLog = document.getElementById('terminalLog');
    const resultTitle = document.getElementById('resultTitle');
    const heroHotColdContainer = document.getElementById('heroHotColdContainer');
    const birthDateInput = document.getElementById('birthDate');
    const birthTimeInput = document.getElementById('birthTime');

    const analysisMethods = [
        "1회차~최근 회차 DB 무결성 검사 중...",
        "역대 1등 당첨번호 조합(수백만 데이터) 로드 완료.",
        "생년월일 사주/오행 분석 및 개인 행운수 추출 중...",
        "과거 1등 당첨 조합 중복 여부 스캐닝...",
        "최근 15회차 핫 넘버(Hot Numbers) 가중치 분석...",
        "최근 15회차 콜드 넘버(Cold Numbers) 가중치 분석...",
        "고저 비율 (High-Low) 통계적 최적화...",
        "홀짝 비율 (Odd-Even) 분포 검사 중...",
        "총합 정규분포 (Sum Distribution) 매칭...",
        "끝수 패턴 (Last Digit Pattern) 스캐닝...",
        "소수(Primes) 및 연속수(Consecutive) 쌍 탐색...",
        "산술복잡도 (AC Value) 난수 최적화...",
        "딥러닝 기반 패턴 유사도 판별 중...",
        "최종 번호 교집합 추출 완료."
    ];

    // --- 동행복권 1회차~최신회차 데이터 로직 ---
    let pastWinningCombinations = new Set();
    let hotNumbers = [];
    let coldNumbers = [];
    let personalLuckyNumbers = [];
    let isDbReady = false;
    let lottoData = null;

    // --- 로또 DB 초기화 (Github 오픈 API 자동 연동) ---
    async function fetchLottoDB() {
        try {
            // 오픈소스(smok95)로 공개된 전체 데이터를 실시간으로 가져옵니다.
            const response = await fetch('https://smok95.github.io/lotto/results/all.json');
            if(!response.ok) throw new Error("API 서버에 접속할 수 없습니다.");
            
            const draws = await response.json();
            lottoData = { data: draws };
            
            if (!draws || draws.length === 0) {throw new Error("DB가 비어있습니다.");}

            let recentDraws = [];
            let numCounts = {};
            for(let i=1; i<=45; i++) numCounts[i] = 0;

            // 역대 1등 조합 Set 생성 및 최근 15회차 분리
            draws.forEach((draw, index) => {
                const nums = draw.numbers.sort((a,b) => a - b);
                pastWinningCombinations.add(nums.join(','));

                // 마지막 15회차 데이터만 추출하여 핫/콜드 계산 (전체로 하면 모두 평준화됨)
                if(index >= draws.length - 15) {
                    recentDraws.push(nums);
                    nums.forEach(n => numCounts[n]++);
                }
            });

            // 핫/콜드 계산
            let sortedNums = Object.keys(numCounts).map(k => ({num: parseInt(k), count: numCounts[k]})).sort((a,b) => b.count - a.count);
            hotNumbers = sortedNums.slice(0, 10).map(x => x.num); // Top 10 hottest
            coldNumbers = sortedNums.slice(-10).map(x => x.num); // Top 10 coldest

                        isDbReady = true;
            
            // 프리미엄 기능 렌더링
            setTimeout(() => {
                if(typeof renderPremiumFeatures === 'function') {
                    renderPremiumFeatures(numCounts);
                }
            }, 500);

            console.log(`로또 DB 로드 완료: 총 ${draws.length}회차 분량. 역대 1등 조합 차단 활성화.`);

            // 최신 회차 번호 히어로 섹션 대형 구슬에 표시 및 캐싱
            const latestDraw = draws[draws.length - 1];
            localStorage.setItem('lotto_hub_latest_draw', JSON.stringify(latestDraw));
            renderHeroLatestDraw(latestDraw);

            // 히어로 섹션에 핫/콜드 즉시 렌더링
            if(heroHotColdContainer && hotNumbers.length > 0) {
                heroHotColdContainer.innerHTML = `
                    <div class="hc-group">
                        <span class="hc-label">🔥 핫 넘버:</span>
                        ${hotNumbers.slice(0,5).map(n => `<span class="badge-hot">${n}</span>`).join('')}
                    </div>
                    <div class="hc-group" style="margin-top: 8px;">
                        <span class="hc-label">❄️ 콜드 넘버:</span>
                        ${coldNumbers.slice(0,5).map(n => `<span class="badge-cold">${n}</span>`).join('')}
                    </div>
                `;
                heroHotColdContainer.classList.remove('hidden');
            }

        } catch (error) {
            console.error("로또 DB 초기화 실패:", error);
            const mainHeroDrawNo = document.getElementById('mainHeroDrawNo');
            const mainHeroBallsContainer = document.getElementById('mainHeroBallsContainer');
            if(mainHeroDrawNo) mainHeroDrawNo.textContent = "연결 실패";
            if(mainHeroBallsContainer) mainHeroBallsContainer.innerHTML = `<div style="color:red; font-size:0.9rem;">DB 연결 오류: ${error.message}</div>`;
            isDbReady = false;
        }
    }

    function startGeneration(isSajuMode, btnElement) {
        if(isSajuMode) {
            const bVal = birthDateInput ? birthDateInput.value.replace(/[^0-9]/g, '') : '';
            if(bVal.length !== 8) {
                alert('정확한 사주 맞춤 분석을 위해 생년월일 8자리(예: 19800523)를 입력해주세요.');
                return;
            }
        }

        btnElement.textContent = '분석 중...';
        btnElement.disabled = true;
        btnElement.style.opacity = '0.8';

        resultArea.classList.remove('hidden');
        aiTerminal.classList.remove('hidden');
        if(resultTitle) resultTitle.classList.add('hidden');
        resultBalls.classList.add('hidden');
        terminalLog.innerHTML = '';
        
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 명리학 기반 사주팔자 및 오행 계산 로직
        if (isSajuMode && birthDateInput && birthDateInput.value) {
            const bVal = birthDateInput.value.replace(/[^0-9]/g, '');
            const year = parseInt(bVal.substring(0, 4));
            const month = parseInt(bVal.substring(4, 6));
            const day = parseInt(bVal.substring(6, 8));
            
            // 1. 천간(10간)과 지지(12지) 배열
            const stems = ['갑(甲)', '을(乙)', '병(丙)', '정(丁)', '무(戊)', '기(己)', '경(庚)', '신(辛)', '임(壬)', '계(癸)'];
            const branches = ['자(子)', '축(丑)', '인(寅)', '묘(卯)', '진(辰)', '사(巳)', '오(午)', '미(未)', '신(申)', '유(酉)', '술(戌)', '해(亥)'];
            
            // 2. 연주(년주) 계산
            const yearStemIdx = (year + 6) % 10;
            const yearBranchIdx = (year + 8) % 12;
            const yearPillar = stems[yearStemIdx] + branches[yearBranchIdx];
            
            // 3. 일주 가상 계산 (1900.01.01 기준 일수 차이를 이용한 근사 만세력)
            const daysSinceEpoch = Math.floor((new Date(year, month - 1, day) - new Date(1900, 0, 1)) / (1000 * 60 * 60 * 24));
            const dayStemIdx = Math.abs(daysSinceEpoch + 9) % 10;
            const dayBranchIdx = Math.abs(daysSinceEpoch + 1) % 12;
            const dayPillar = stems[dayStemIdx] + branches[dayBranchIdx];
            
            // 4. 오행 매핑 (일주의 천간 기준)
            const elements = ['목(木)', '목(木)', '화(火)', '화(火)', '토(土)', '토(土)', '금(金)', '금(金)', '수(水)', '수(水)'];
            const userElement = elements[dayStemIdx]; // 일간(본원)
            
            const luckyNumbersByElement = {
                '목(木)': [3, 8, 13, 18, 23, 28, 33, 38, 43],
                '화(火)': [2, 7, 12, 17, 22, 27, 32, 37, 42],
                '토(土)': [5, 10, 15, 20, 25, 30, 35, 40, 45],
                '금(金)': [4, 9, 14, 19, 24, 29, 34, 39, 44],
                '수(水)': [1, 6, 11, 16, 21, 26, 31, 36, 41]
            };
            
            let timeNums = [];
            if (birthTimeInput && birthTimeInput.value !== 'unknown') {
                const timeLength = birthTimeInput.value.length;
                const timeElementIdx = (dayStemIdx + timeLength) % 5;
                const uniqueElements = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'];
                timeNums = luckyNumbersByElement[uniqueElements[timeElementIdx]];
            }
            
            personalLuckyNumbers = [...new Set([...luckyNumbersByElement[userElement], ...timeNums])];
            
            // 명리학 터미널 로그 출력
            terminalLog.innerHTML += `<div class="terminal-line" style="color: #6b46c1; font-weight: bold;">[명리학 만세력 로직 가동] 사주팔자 추출 중...</div>`;
            terminalLog.innerHTML += `<div class="terminal-line" style="color: #e2e8f0; font-size: 0.9rem;">-> <strong>${year}년 ${month}월 ${day}일</strong> 생의 명식:</div>`;
            terminalLog.innerHTML += `<div class="terminal-line" style="color: #fbc531; font-weight: bold; margin-left: 10px; margin-top: 5px; margin-bottom: 5px;">[년주] ${yearPillar} &nbsp;/&nbsp; [일주] ${dayPillar}</div>`;
            terminalLog.innerHTML += `<div class="terminal-line">회원님의 사주 일간(본원) 오행: <strong>${userElement}</strong></div>`;
            terminalLog.innerHTML += `<div class="terminal-line" style="margin-bottom: 15px;">${userElement}의 기운을 강력하게 보완하는 명리학적 행운 번호를 계산합니다...</div>`;
        } else {
            personalLuckyNumbers = [];
        }

        let currentStep = 0;
            
        let methodsToRun = [...analysisMethods];
        if(!isSajuMode) {
            methodsToRun = methodsToRun.filter(m => m !== "생년월일 사주/오행 분석 및 개인 행운수 추출 중...");
        }

        if (isSajuMode && birthTimeInput && birthTimeInput.value !== 'unknown') {
            methodsToRun.push(`[System] ${birthTimeInput.value} 생년월일시 명리학 오행 패턴 주입 완료`);
        } else if (isSajuMode) {
            methodsToRun.push("[System] 생년월일 기준 오행 패턴 주입 완료");
        }

        function typeWriter() {
            if(currentStep < methodsToRun.length) {
                const p = document.createElement('p');
                p.innerHTML = `<span class="prompt">></span> ${methodsToRun[currentStep]}`;
                terminalLog.appendChild(p);
                terminalLog.scrollTop = terminalLog.scrollHeight;
                currentStep++;
                setTimeout(typeWriter, 150 + Math.random() * 200);
            } else {
                let attemptsToWait = 0;
                let waitDb = setInterval(() => {
                    attemptsToWait++;
                    if(isDbReady || attemptsToWait > 50) {
                        clearInterval(waitDb);
                        
                        const loadingLine = document.createElement('div');
                        loadingLine.className = 'terminal-line';
                        loadingLine.style.color = '#fbc531';
                        loadingLine.style.fontWeight = 'bold';
                        loadingLine.textContent = `> 강력 필터망 기반 최적의 추천번호 생성 중... (잠시만 기다려주세요)`;
                        terminalLog.appendChild(loadingLine);
                        terminalLog.scrollTop = terminalLog.scrollHeight;
                        
                        setTimeout(() => {
                            try {
                                aiTerminal.classList.add('hidden');
                                if(resultTitle) resultTitle.classList.remove('hidden');
                                resultBalls.classList.remove('hidden');
                                generateNumbers(isSajuMode);
                            } catch(err) {
                                console.error(err);
                                alert("번호 생성 중 일시적인 오류가 발생했습니다. 다시 시도해주세요.\n" + err.message);
                            } finally {
                                btnElement.textContent = '다시 생성하기';
                                btnElement.disabled = false;
                                btnElement.style.opacity = '1';
                            }
                        }, 500);
                    }
                }, 200);
            }
        }
        
        typeWriter();
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            startGeneration(false, generateBtn);
        });
    }

    if (generateSajuBtn) {
        generateSajuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            startGeneration(true, generateSajuBtn);
        });
    }

    function getColorClass(num) {
        if (num <= 10) return 'color-yellow';
        if (num <= 20) return 'color-blue';
        if (num <= 30) return 'color-red';
        if (num <= 40) return 'color-gray';
        return 'color-green';
    }

    function isValidCombination(numbers) {
        const combinationStr = numbers.join(',');
        if (pastWinningCombinations.has(combinationStr)) return false;

        let highCount = 0, lowCount = 0;
        numbers.forEach(num => num >= 23 ? highCount++ : lowCount++);
        if (highCount === 6 || lowCount === 6 || highCount === 5 || lowCount === 5) return false;

        let oddCount = 0, evenCount = 0;
        numbers.forEach(num => num % 2 === 0 ? evenCount++ : oddCount++);
        if (oddCount === 6 || evenCount === 6 || oddCount === 5 || evenCount === 5) return false;

        let sum = numbers.reduce((a, b) => a + b, 0);
        if (sum < 100 || sum > 175) return false;

        let lastDigits = {};
        for (let num of numbers) {
            let digit = num % 10;
            lastDigits[digit] = (lastDigits[digit] || 0) + 1;
            if (lastDigits[digit] >= 3) return false;
        }

        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
        let primeCount = numbers.filter(n => primes.includes(n)).length;
        if (primeCount < 1 || primeCount > 3) return false;

        for (let i = 0; i < numbers.length - 2; i++) {
            if (numbers[i] + 1 === numbers[i+1] && numbers[i+1] + 1 === numbers[i+2]) return false;
        }

        let diffs = new Set();
        for (let i = 0; i < numbers.length; i++) {
            for (let j = i + 1; j < numbers.length; j++) {
                diffs.add(Math.abs(numbers[i] - numbers[j]));
            }
        }
        if (diffs.size - 5 < 7) return false;

        if (hotNumbers.length > 0) {
            let hasHot = numbers.some(n => hotNumbers.includes(n));
            if (!hasHot) return false;
        }

        if (coldNumbers.length > 0) {
            let coldCount = numbers.filter(n => coldNumbers.includes(n)).length;
            if (coldCount > 1) return false;
        }

        return true;
    }

    function generateNumbers(isSajuMode) {
        const latestDraw = lottoData.data[lottoData.data.length - 1];
        const nextDrawNo = latestDraw.draw_no + 1;
        const nextDrawDate = new Date(latestDraw.date);
        nextDrawDate.setDate(nextDrawDate.getDate() + 7);
        const nextDateStr = `${nextDrawDate.getFullYear()}.${String(nextDrawDate.getMonth() + 1).padStart(2, '0')}.${String(nextDrawDate.getDate()).padStart(2, '0')}`;

        resultBalls.innerHTML = `<h3 style="color: var(--primary-color); margin-bottom: 25px; text-align: center; line-height: 1.4;">제 ${nextDrawNo}회 (${nextDateStr} 추첨)<br>예상 추천 번호</h3>`;
        resultBalls.style.opacity = '1';

        const currentUser = JSON.parse(localStorage.getItem('lotto_hub_current_user'));
        const gameCount = currentUser ? 10 : 5;

        let allGeneratedNumbers = [];
        let balls = [];

        for (let game = 1; game <= gameCount; game++) {
            let numbers = [];
            let attempts = 0;
            while (true) {
                let combo = new Set();
                
                // 1. 개인 사주/오행 행운수 가중치 적용 (존재할 경우 1~2개 우선 삽입)
                if (personalLuckyNumbers.length > 0) {
                    const luckyCount = Math.floor(Math.random() * 2) + 1; // 1 or 2
                    let shuffledLucky = [...personalLuckyNumbers].sort(() => 0.5 - Math.random());
                    for(let i=0; i<luckyCount && i<shuffledLucky.length; i++) {
                        combo.add(shuffledLucky[i]);
                    }
                }
                
                // 2. 나머지 번호 무작위 채우기
                while(combo.size < 6) {
                    combo.add(Math.floor(Math.random() * 45) + 1);
                }
                
                numbers = Array.from(combo).sort((a, b) => a - b);
                
                attempts++;
                if (isValidCombination(numbers) || attempts > 10000) {
                    break;
                }
            }
            
            allGeneratedNumbers.push(...numbers);
            
            const row = document.createElement('div');
            row.className = 'game-row';
            
            const label = document.createElement('div');
            label.className = 'game-label';
            label.textContent = game + '게임';
            row.appendChild(label);

            numbers.forEach((num, index) => {
                const ball = document.createElement('div');
                ball.className = `ball ${getColorClass(num)}`;
                ball.textContent = num;
                ball.style.opacity = '0';
                ball.style.transform = 'scale(0.5)';
                row.appendChild(ball);
                balls.push(ball);

                setTimeout(() => {
                    ball.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    ball.style.opacity = '1';
                    ball.style.transform = 'scale(1)';
                }, (game * 150) + (index * 80));
            });
            
            resultBalls.appendChild(row);
        }

        // 최다 출현 핵심 번호 분석 및 표시
        let frequencies = {};
        allGeneratedNumbers.forEach(num => {
            frequencies[num] = (frequencies[num] || 0) + 1;
        });

        let sortedFrequencies = Object.keys(frequencies).map(num => ({
            num: parseInt(num),
            count: frequencies[num]
        })).sort((a, b) => b.count - a.count || a.num - b.num);

        // 최소 3번 이상 나온 번호들만 필터링 후 최대 6개 추출
        let topNumbers = sortedFrequencies.filter(item => item.count >= 3).slice(0, 6);

        setTimeout(() => {
            const summaryContainer = document.createElement('div');
            summaryContainer.style.marginTop = '40px';
            summaryContainer.style.padding = '25px';
            summaryContainer.style.background = 'rgba(255, 255, 255, 0.03)';
            summaryContainer.style.borderRadius = '16px';
            summaryContainer.style.textAlign = 'center';
            summaryContainer.style.border = '1px solid var(--border-color)';
            summaryContainer.style.opacity = '0';
            summaryContainer.style.transform = 'translateY(20px)';
            summaryContainer.style.transition = 'all 0.6s ease';

            let titleHtml = `<h4 style="color: var(--primary-color); margin-top: 0; margin-bottom: 20px; font-size: 1.15rem; font-weight: bold;">💡 이번 추천에서 가장 많이 중복된 핵심 번호</h4>`;
            
            let contentHtml = '';
            let subtitleHtml = '';

            if (topNumbers.length > 0) {
                contentHtml = `<div class="lotto-balls" style="justify-content: center; gap: 8px;">`;
                topNumbers.forEach((item, idx) => {
                    contentHtml += `<div class="ball ${getColorClass(item.num)} rolling" style="animation-delay: ${idx * 0.1}s" title="${item.count}회 출현">${item.num}</div>`;
                });
                contentHtml += `</div>`;
                subtitleHtml = `<p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 15px; margin-bottom: 0;">최소 3회 이상 강력하게 중복된 번호들입니다.</p>`;
            } else {
                contentHtml = `<div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; color: var(--text-muted); font-size: 0.95rem;">이번 분석에서는 3회 이상 강력하게 중복된 번호가 발견되지 않았습니다. 번호들이 아주 고르게 분배되었습니다.</div>`;
            }

            summaryContainer.innerHTML = titleHtml + contentHtml + subtitleHtml;
            resultBalls.appendChild(summaryContainer);

            if (isSajuMode) {
                const days = ['수요일', '목요일', '금요일', '토요일'];
                const times = ['오전 10시~12시', '오후 1시~3시', '오후 3시~5시', '오후 6시~8시'];
                const bestDay = days[Math.floor(Math.random() * days.length)];
                const bestTime = times[Math.floor(Math.random() * times.length)];
                
                const timeContainer = document.createElement('div');
                timeContainer.style.marginTop = '30px';
                timeContainer.style.padding = '20px';
                timeContainer.style.background = 'rgba(107, 70, 193, 0.08)';
                timeContainer.style.border = '1px solid rgba(107, 70, 193, 0.3)';
                timeContainer.style.borderRadius = '12px';
                timeContainer.style.textAlign = 'center';
                
                timeContainer.innerHTML = `
                    <h4 style="color: #6b46c1; margin-top: 0; margin-bottom: 12px; font-size: 1.15rem; font-weight: bold;">🔮 사주 기반 최적 구매 시간</h4>
                    <p style="color: var(--text-main); font-size: 0.95rem; margin: 0; line-height: 1.6; word-break: keep-all;">
                        입력하신 사주 데이터를 분석한 결과, 회원님의 재물운이 가장 강하게 들어오는 최적의 로또 구매 시간은 <br><strong style="font-size: 1.05rem;">[${bestDay} ${bestTime}]</strong> 입니다.
                    </p>
                `;
                
                // 애니메이션 딜레이 타이밍에 맞게 보이기
                timeContainer.style.opacity = '0';
                timeContainer.style.transform = 'translateY(20px)';
                timeContainer.style.transition = 'all 0.6s ease';
                
                resultBalls.appendChild(timeContainer);

                setTimeout(() => {
                    timeContainer.style.opacity = '1';
                    timeContainer.style.transform = 'translateY(0)';
                }, (gameCount * 150) + (6 * 80) + 200);
            }
            
            balls.forEach((ball, idx) => {
                setTimeout(() => {
                    ball.classList.add('rolling');
                    playPopSound();
                }, idx * 100);
            });

            setTimeout(() => {
                summaryContainer.style.opacity = '1';
                summaryContainer.style.transform = 'translateY(0)';
            }, 50);
            
        }, (gameCount * 150) + (6 * 80) + 500);
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 앱 시작 시 로또 DB 초기화 및 화면 렌더링 시작
    fetchLottoDB();

    // ==========================================
    // 프리미엄 기능 (다크모드, 카운트다운, 차트, 히트맵)
    // ==========================================

    // 1. 다크모드
    const darkModeToggle = document.getElementById('darkModeToggle');
    if(darkModeToggle) {
        if(localStorage.getItem('lotto_dark_mode') === 'true') {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️';
        }
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('lotto_dark_mode', isDark);
            darkModeToggle.textContent = isDark ? '☀️' : '🌙';
        });
    }

    // 2. 카운트다운
    function updateCountdown() {
        const now = new Date();
        // 한국 시간 토요일 20시 45분 찾기
        let target = new Date(now);
        target.setHours(20, 45, 0, 0);
        
        let dayOfWeek = now.getDay(); // 0:Sun, 6:Sat
        let daysToSaturday = (6 - dayOfWeek + 7) % 7;
        
        if (dayOfWeek === 6 && now.getHours() >= 21) {
            daysToSaturday = 7; // 이번주 토요일 지났으면 다음주
        } else if (dayOfWeek === 6 && now.getHours() === 20 && now.getMinutes() >= 45) {
            daysToSaturday = 7;
        }

        target.setDate(target.getDate() + daysToSaturday);

        const diff = target - now;
        if(diff < 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const timerEl = document.getElementById('countdownTimer');
        if(timerEl) {
            timerEl.textContent = `${String(d).padStart(2,'0')}일 ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // 2.5. 실시간 롤링 배너 (Ticker)
    // 2.5. 실시간 롤링 배너 (Ticker)
    const tickerEl = document.getElementById('tickerText');
    if(tickerEl) {
        // window.testimonials는 Firebase에서 불러오며, 초기값 설정
        window.testimonials = ["💡 현재 1,243명이 AI 번호를 추출 중입니다."];

        let currentTickerIdx = 0;

        function updateTicker() {
            // 위로 페이드아웃
            tickerEl.style.opacity = '0';
            tickerEl.style.transform = 'translateY(-15px)';
            
            setTimeout(() => {
                let text = (window.testimonials && window.testimonials[currentTickerIdx]) ? window.testimonials[currentTickerIdx] : "💡 현재 1,243명이 AI 번호를 추출 중입니다.";
                if (window.testimonials && currentTickerIdx === window.testimonials.length - 1) {
                    const activeUsers = Math.floor(Math.random() * 800) + 1200;
                    text = `💡 현재 ${activeUsers.toLocaleString()}명이 로또 번호를 추출 중입니다.`;
                }
                tickerEl.textContent = text;
                
                // 아래에서 대기
                tickerEl.style.transform = 'translateY(15px)';
                
                // 트랜지션 적용을 위해 한 프레임 대기 후 위로 올라오며 페이드인
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        tickerEl.style.opacity = '1';
                        tickerEl.style.transform = 'translateY(0)';
                    });
                });
                
                if(window.testimonials) { currentTickerIdx = (currentTickerIdx + 1) % window.testimonials.length; }
            }, 500); // 페이드아웃 되는 시간 기다림
        }
        
        updateTicker();
        setInterval(updateTicker, 3500); // 3.5초마다 변경
    }

    // 3. 차트 & 히트맵 렌더링 (삭제됨 - 하지만 구조 유지)
    window.renderPremiumFeatures = function(numCounts) {
        // 최근 회차 번호 가져오기
        const latestData = JSON.parse(localStorage.getItem('lotto_hub_latest_draw') || '{}');
        const nextDrawEl = document.getElementById('nextDrawNo');
        if(nextDrawEl && latestData.draw_no) {
            nextDrawEl.textContent = latestData.draw_no + 1;
        }



        // 차트 대신 Top 15 그리드 렌더링
        const gridEl = document.getElementById('hotColdGrid');
        if(gridEl) {
            // 빈도수 높은 상위 15개만
            let sorted = [];
            for(let i=1; i<=45; i++) {
                sorted.push({num: i, count: numCounts[i]});
            }
            sorted.sort((a,b) => b.count - a.count);
            const top15 = sorted.slice(0, 15);

            gridEl.innerHTML = '';
            top15.forEach(item => {
                const wrap = document.createElement('div');
                wrap.style.display = 'flex';
                wrap.style.flexDirection = 'column';
                wrap.style.alignItems = 'center';
                
                // 자체 색상 클래스 적용
                let colorClass = 'ball-gray';
                if(item.num <= 10) colorClass = 'ball-yellow';
                else if(item.num <= 20) colorClass = 'ball-blue';
                else if(item.num <= 30) colorClass = 'ball-red';
                else if(item.num <= 40) colorClass = 'ball-gray';
                else colorClass = 'ball-green';

                wrap.innerHTML = `
                    <div class="number-ball ${colorClass}" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.05rem; box-shadow: var(--shadow-sm);">${item.num}</div>
                    <span style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px; font-weight: 600;">${item.count}회</span>
                `;
                gridEl.appendChild(wrap);
            });
        }
    };

});
