import os

css_append = """
/* --- 5가지 프리미엄 UI 기능 (다크모드, 히트맵, 카운트다운 등) --- */

/* 1. 다크 모드 (Dark Mode) 변수 재정의 */
body.dark-mode {
    --bg-main: #0f172a;
    --bg-secondary: #1e293b;
    --bg-card: #1e293b;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --border-color: #334155;
    --ball-color: #334155;
    --ball-border: #475569;
    --ball-text: #f8fafc;
}
body.dark-mode .community-preview { background: rgba(30, 41, 59, 0.85); border-color: rgba(51, 65, 85, 0.8); }
body.dark-mode .community-preview li { background: rgba(15, 23, 42, 0.9); border-color: rgba(51, 65, 85, 0.5); }
body.dark-mode .community-preview li:hover { background: #334155; }
body.dark-mode .terminal { background: #000; border-color: #333; }
body.dark-mode .feature-card { background: var(--bg-card); box-shadow: 0 4px 6px rgba(0,0,0,0.3); }

/* 다크모드 토글 버튼 */
.theme-toggle-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: 15px;
    padding: 5px;
    border-radius: 50%;
    transition: background 0.2s;
}
.theme-toggle-btn:hover { background: var(--border-color); }

/* 2. 카운트다운 타이머 UI */
.countdown-container {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: white;
    text-align: center;
    padding: 10px 0;
    font-weight: 600;
    font-size: 1.1rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.countdown-time { font-family: monospace; font-size: 1.3rem; letter-spacing: 2px; font-weight: 700; background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 6px; margin-left: 10px; }

/* 3. 데이터 시각화 차트 및 히트맵 래퍼 */
.analysis-dashboard {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin: 30px 0;
    justify-content: center;
}
.chart-container {
    flex: 1 1 400px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow-sm);
}

/* 4. 히트맵 (Heatmap) 그리드 */
.heatmap-container {
    flex: 1 1 300px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow-sm);
}
.heatmap-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    margin-top: 15px;
}
.heatmap-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
    border-radius: 4px;
    color: rgba(255,255,255,0.9);
    transition: transform 0.2s;
}
.heatmap-cell:hover { transform: scale(1.1); z-index: 2; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }

/* 히트맵 온도(색상) 범례 */
.heatmap-legend { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 10px; }
.legend-gradient { height: 8px; flex-grow: 1; margin: 0 10px; border-radius: 4px; background: linear-gradient(to right, #3b82f6, #94a3b8, #ef4444); }

/* 5. AI 진행률 프로그레스 바 */
.terminal-progress {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    margin-bottom: 15px;
    overflow: hidden;
    position: relative;
    display: none;
}
.terminal-progress-bar {
    height: 100%;
    width: 0%;
    background: #10b981;
    box-shadow: 0 0 10px #10b981;
    transition: width 0.3s ease;
}
"""

with open('style.css', 'a', encoding='utf-8') as f:
    f.write(css_append)
print("CSS appended to style.css")
