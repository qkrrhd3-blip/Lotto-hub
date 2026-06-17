import os
path = r'c:\Users\s0023\OneDrive\바탕 화면\로또 ai\script.js'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

target = '''    const tickerEl = document.getElementById('tickerText');
    if(tickerEl) {
        let userPosts = [];
        try {
            const posts = JSON.parse(localStorage.getItem('lotto_hub_posts')) || [];
            // 관리자가 아닌 실제 유저가 작성한 글 중, '당첨/후기/인증/적중' 등의 단어가 포함된 글(당첨 후기)만 필터링
            userPosts = posts.filter(p => 
                p.author !== 'Lotto hub 관리자' && 
                (p.title.includes('당첨') || p.title.includes('후기') || p.title.includes('인증') || p.title.includes('적중'))
            );
        } catch(e) {}

        let testimonials = [];
        if (userPosts.length > 0) {
            // 가장 최근 유저 게시글 최대 5개 반영
            testimonials = userPosts.slice(0, 5).map(p => `🎉 [커뮤니티] ${p.author}님: ${p.title}`);
        }
        // 마지막에는 무조건 접속자 수 추가
        testimonials.push("💡 현재 1,243명이 AI 번호를 추출 중입니다.");'''

replacement = '''    // 2.5. 실시간 롤링 배너 (Ticker)
    const tickerEl = document.getElementById('tickerText');
    if(tickerEl) {
        // window.testimonials는 Firebase에서 불러오며, 초기값 설정
        window.testimonials = ["💡 현재 1,243명이 AI 번호를 추출 중입니다."];'''

code = code.replace(target, replacement)

code = code.replace('let text = testimonials[currentTickerIdx];', 'let text = (window.testimonials && window.testimonials[currentTickerIdx]) ? window.testimonials[currentTickerIdx] : "💡 현재 1,243명이 AI 번호를 추출 중입니다.";')
code = code.replace('if (currentTickerIdx === testimonials.length - 1)', 'if (window.testimonials && currentTickerIdx === window.testimonials.length - 1)')
code = code.replace('currentTickerIdx = (currentTickerIdx + 1) % testimonials.length;', 'if(window.testimonials) { currentTickerIdx = (currentTickerIdx + 1) % window.testimonials.length; }')

# Now update loadCommunityPreview
target2 = '''        if (posts.length === 0) {
            previewList.innerHTML = '<li style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 10px;">아직 등록된 후기가 없습니다.</li>';
            if(tickerText) tickerText.innerHTML = '🔥 첫 당첨 후기의 주인공이 되어보세요!';
            return;
        }

        const topPosts = posts;'''

replacement2 = '''        if (posts.length === 0) {
            previewList.innerHTML = '<li style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 10px;">아직 등록된 후기가 없습니다.</li>';
            window.testimonials = ['🔥 첫 당첨 후기의 주인공이 되어보세요!', "💡 현재 1,243명이 AI 번호를 추출 중입니다."];
            return;
        }

        const topPosts = posts;
        let userT = posts.slice(0,5).map(p => `🎉 [커뮤니티] ${p.author}님: ${p.title}`);
        userT.push("💡 현재 1,243명이 AI 번호를 추출 중입니다.");
        window.testimonials = userT;'''

code = code.replace(target2, replacement2)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

os.system('git add script.js && git commit -m "fix: ticker reading from localStorage" && git push')
