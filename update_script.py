import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update fetchLottoDB to call renderChart and renderHeatmap, and setup Countdown
db_ready_target = "isDbReady = true;"
premium_inits = """            isDbReady = true;
            
            // 프리미엄 기능 렌더링
            setTimeout(() => {
                if(typeof renderPremiumFeatures === 'function') {
                    renderPremiumFeatures(numCounts);
                }
            }, 500);
"""
if "renderPremiumFeatures" not in content:
    content = content.replace(db_ready_target, premium_inits)

# 2. Update startGeneration to have 3 seconds loading animation
# We will find where terminal messages are pushed and delays are applied.
# Currently it does:
# setTimeout(() => { appendTerminalMessage(...) }, ...);
# We can rewrite the terminal animation entirely or just modify the initial delay before showResults.
# Let's search for "setTimeout(() => { showResults("
# It looks like:
#        setTimeout(() => {
#            showResults(selectedGames);
#        }, 1200);

if "1200" in content and "showResults(" in content:
    old_show_results = """        setTimeout(() => {
            showResults(selectedGames);
        }, 1200);"""
    
    new_show_results = """        // AI 로딩 애니메이션 3초 (프로그레스 바 포함)
        const progressBar = document.getElementById('aiProgressBar');
        const progressContainer = document.getElementById('aiProgressContainer');
        if(progressContainer) progressContainer.style.display = 'block';
        if(progressBar) progressBar.style.width = '0%';
        
        let p = 0;
        const pInterval = setInterval(() => {
            p += 2;
            if(progressBar) progressBar.style.width = p + '%';
        }, 60);

        setTimeout(() => {
            appendTerminalMessage("> 몬테카를로 시뮬레이션 심층 분석 중...");
        }, 1000);
        setTimeout(() => {
            appendTerminalMessage("> 비정상 아웃라이어 패턴 필터링 중...");
        }, 2000);

        setTimeout(() => {
            clearInterval(pInterval);
            if(progressBar) progressBar.style.width = '100%';
            setTimeout(() => {
                if(progressContainer) progressContainer.style.display = 'none';
                showResults(selectedGames);
            }, 200);
        }, 3000);"""
    content = content.replace(old_show_results, new_show_results)

# 3. Append global premium features functions before DOMContentLoaded ends
append_js = """

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

    // 3. 차트 & 히트맵 렌더링
    window.renderPremiumFeatures = function(numCounts) {
        // 최근 회차 번호 가져오기
        const latestData = JSON.parse(localStorage.getItem('lotto_hub_latest_draw') || '{}');
        const nextDrawEl = document.getElementById('nextDrawNo');
        if(nextDrawEl && latestData.drwNo) {
            nextDrawEl.textContent = latestData.drwNo + 1;
        }

        // 히트맵 렌더링
        const heatmapEl = document.getElementById('lottoHeatmap');
        if(heatmapEl) {
            heatmapEl.innerHTML = '';
            // 최고 빈도수 찾기
            let maxCount = 0;
            for(let i=1; i<=45; i++) {
                if(numCounts[i] > maxCount) maxCount = numCounts[i];
            }

            for(let i=1; i<=45; i++) {
                const count = numCounts[i] || 0;
                // 온도 비율 0 ~ 1
                const ratio = maxCount > 0 ? count / maxCount : 0;
                
                let r, g, b;
                if(ratio < 0.5) {
                    // Cold (Blue to Gray)
                    // Blue(59,130,246) -> Gray(148,163,184)
                    const subRatio = ratio * 2; 
                    r = Math.round(59 + (148 - 59) * subRatio);
                    g = Math.round(130 + (163 - 130) * subRatio);
                    b = Math.round(246 + (184 - 246) * subRatio);
                } else {
                    // Hot (Gray to Red)
                    // Gray(148,163,184) -> Red(239,68,68)
                    const subRatio = (ratio - 0.5) * 2;
                    r = Math.round(148 + (239 - 148) * subRatio);
                    g = Math.round(163 + (68 - 163) * subRatio);
                    b = Math.round(184 + (68 - 184) * subRatio);
                }

                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';
                cell.style.background = `rgb(${r},${g},${b})`;
                cell.textContent = i;
                cell.title = `${i}번: 최근 15회 중 ${count}회 출현`;
                heatmapEl.appendChild(cell);
            }
        }

        // 차트 렌더링
        const ctx = document.getElementById('hotColdChart');
        if(ctx && window.Chart) {
            // 빈도수 높은 상위 15개만
            let sorted = [];
            for(let i=1; i<=45; i++) {
                sorted.push({num: i, count: numCounts[i]});
            }
            sorted.sort((a,b) => b.count - a.count);
            const top15 = sorted.slice(0, 15);

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: top15.map(x => x.num + '번'),
                    datasets: [{
                        label: '출현 빈도',
                        data: top15.map(x => x.count),
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
    };
"""

# Append just before the final `});`
if "renderPremiumFeatures = function" not in content:
    content = content.replace("\n});", append_js + "\n});")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("script.js updated successfully")
