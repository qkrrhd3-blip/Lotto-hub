// qr.js

let html5QrcodeScanner;

document.addEventListener('DOMContentLoaded', () => {
    // Check if Html5QrcodeScanner is loaded
    if (typeof Html5QrcodeScanner === 'undefined') {
        alert("카메라 라이브러리를 불러오는데 실패했습니다. 새로고침 해주세요.");
        return;
    }

    // Initialize scanner
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: {width: 250, height: 250} },
        /* verbose= */ false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    document.getElementById('rescanBtn').addEventListener('click', () => {
        document.getElementById('result-container').style.display = 'none';
        document.getElementById('reader').style.display = 'block';
        document.getElementById('rescanBtn').style.display = 'none';
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    });
});

async function onScanSuccess(decodedText, decodedResult) {
    // stop scanning
    html5QrcodeScanner.clear();
    document.getElementById('reader').style.display = 'none';
    document.getElementById('rescanBtn').style.display = 'inline-block';
    
    // Parse the QR URL
    // Format: http://m.dhlottery.co.kr/?v=1123q010203040506q070809101112
    if (!decodedText.includes('v=')) {
        alert("지원되지 않는 형식의 QR코드입니다. 동행복권 로또 용지를 스캔해주세요.");
        return;
    }

    try {
        const vMatch = decodedText.match(/v=(\d{4})(.*)/);
        if (!vMatch) throw new Error("Invalid format");
        
        const drawNo = parseInt(vMatch[1], 10);
        const gamesStr = vMatch[2];
        const gameMatches = gamesStr.match(/[a-zA-Z](\d{12})/g);
        
        if (!gameMatches || gameMatches.length === 0) {
            throw new Error("No games found");
        }

        const myGames = gameMatches.map(match => {
            const typeChar = match[0].toLowerCase();
            let typeName = "자동";
            if (typeChar === 'm') typeName = "수동";
            else if (typeChar === 'p') typeName = "반자동";

            const numStr = match.substring(1);
            const numbers = [];
            for(let i=0; i<12; i+=2) {
                numbers.push(parseInt(numStr.substring(i, i+2), 10));
            }
            return { type: typeName, numbers: numbers.sort((a,b)=>a-b) };
        });

        // Show loading state
        document.getElementById('result-container').style.display = 'block';
        document.getElementById('draw-info').textContent = `${drawNo}회 당첨 결과 확인 중...`;
        document.getElementById('draw-date').textContent = "";
        document.getElementById('winning-numbers-box').style.display = 'none';
        document.getElementById('my-games-container').innerHTML = `<p style="text-align:center; padding:20px;">서버와 통신하여 결과를 조회하고 있습니다 ⏳</p>`;

        // Fetch from Firebase
        await checkWinningResult(drawNo, myGames);

    } catch (e) {
        console.error(e);
        alert("QR 코드를 파싱하는 중 오류가 발생했습니다. 다시 스캔해주세요.");
    }
}

function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
}

async function checkWinningResult(drawNo, myGames) {
    try {
        const q = window.firebaseDB.query(
            window.firebaseDB.collection(window.firebaseDB.db, 'winning_numbers'),
            window.firebaseDB.where('drawNo', '==', drawNo)
        );
        const querySnapshot = await window.firebaseDB.getDocs(q);

        if (querySnapshot.empty) {
            // 당첨 번호 아직 없음
            renderPendingResult(drawNo, myGames);
            return;
        }

        const winData = querySnapshot.docs[0].data();
        renderWinningResult(drawNo, myGames, winData);

    } catch (error) {
        console.error("Error fetching winning numbers:", error);
        document.getElementById('my-games-container').innerHTML = `<p style="text-align:center; color:red;">결과 조회에 실패했습니다. 인터넷 연결을 확인해주세요.</p>`;
    }
}

function renderPendingResult(drawNo, myGames) {
    document.getElementById('draw-info').textContent = `${drawNo}회 추첨 대기중 ⏳`;
    document.getElementById('winning-numbers-box').style.display = 'none';
    
    const container = document.getElementById('my-games-container');
    container.innerHTML = '';
    
    const letters = ['A', 'B', 'C', 'D', 'E'];
    myGames.forEach((game, index) => {
        const div = document.createElement('div');
        div.className = 'result-game';
        
        let ballsHtml = game.numbers.map(n => `<span class="number-ball" style="background: ${getBallColor(n)}">${n}</span>`).join('');
        
        div.innerHTML = `
            <div style="flex:1;">
                <span style="font-weight:bold; width: 30px; display:inline-block; color:var(--text-muted);">${letters[index]}</span>
                <span style="font-size:0.8rem; background:#f1f5f9; padding:2px 6px; border-radius:4px; margin-right:10px;">${game.type}</span>
            </div>
            <div style="flex:3; text-align:center;">
                ${ballsHtml}
            </div>
            <div style="flex:1; text-align:right;">
                <span class="badge win-badge-none">결과대기</span>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderWinningResult(drawNo, myGames, winData) {
    document.getElementById('draw-info').textContent = `${drawNo}회 스캔 결과`;
    document.getElementById('draw-date').textContent = `추첨일: ${winData.date || '알 수 없음'}`;
    
    // Show actual winning numbers
    const winBox = document.getElementById('winning-numbers-box');
    winBox.style.display = 'block';
    
    let actualHtml = winData.numbers.map(n => `<span class="number-ball" style="background: ${getBallColor(n)}">${n}</span>`).join('');
    actualHtml += `<span style="font-size:1.5rem; margin: 0 5px; color:var(--text-muted);">+</span>`;
    actualHtml += `<span class="number-ball" style="background: ${getBallColor(winData.bonus)}">${winData.bonus}</span>`;
    document.getElementById('actual-winning-numbers').innerHTML = actualHtml;

    const container = document.getElementById('my-games-container');
    container.innerHTML = '';
    
    const letters = ['A', 'B', 'C', 'D', 'E'];
    let gotPrize = false;

    myGames.forEach((game, index) => {
        const div = document.createElement('div');
        div.className = 'result-game';
        
        let matchCount = 0;
        let hasBonus = false;

        let ballsHtml = game.numbers.map(n => {
            const isMatch = winData.numbers.includes(n);
            const isBonusMatch = n === winData.bonus;
            if (isMatch) matchCount++;
            if (isBonusMatch) hasBonus = true;

            const extraClass = (isMatch || isBonusMatch) ? 'ball-matched' : '';
            const bg = (isMatch || isBonusMatch) ? getBallColor(n) : '#d1d5db';
            return `<span class="number-ball ${extraClass}" style="background: ${bg}">${n}</span>`;
        }).join('');
        
        // Determine rank
        let rankStr = "낙첨";
        let badgeClass = "win-badge-none";
        if (matchCount === 6) { rankStr = "1등 당첨!"; badgeClass = "win-badge-1"; gotPrize = true; }
        else if (matchCount === 5 && hasBonus) { rankStr = "2등 당첨!"; badgeClass = "win-badge-2"; gotPrize = true; }
        else if (matchCount === 5) { rankStr = "3등 당첨"; badgeClass = "win-badge-3"; gotPrize = true; }
        else if (matchCount === 4) { rankStr = "4등 당첨"; badgeClass = "win-badge-4"; gotPrize = true; }
        else if (matchCount === 3) { rankStr = "5등 당첨"; badgeClass = "win-badge-5"; gotPrize = true; }

        div.innerHTML = `
            <div style="flex:1;">
                <span style="font-weight:bold; width: 30px; display:inline-block; color:var(--text-muted);">${letters[index]}</span>
                <span style="font-size:0.8rem; background:#f1f5f9; padding:2px 6px; border-radius:4px; margin-right:10px;">${game.type}</span>
            </div>
            <div style="flex:3; text-align:center;">
                ${ballsHtml}
            </div>
            <div style="flex:1; text-align:right;">
                <span class="badge ${badgeClass}">${rankStr}</span>
            </div>
        `;
        container.appendChild(div);
    });

    if (gotPrize) {
        showFirework();
    }
}

function getBallColor(num) {
    if (num <= 10) return '#fbc02d'; // Yellow
    if (num <= 20) return '#1e88e5'; // Blue
    if (num <= 30) return '#e53935'; // Red
    if (num <= 40) return '#757575'; // Gray
    return '#4caf50'; // Green
}

function showFirework() {
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.innerText = '🎉';
    document.body.appendChild(firework);
    
    setTimeout(() => {
        if(document.body.contains(firework)) document.body.removeChild(firework);
    }, 1500);
}
