import re

with open('style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's cleanly remove everything related to chart and heatmap and rewrite it at the bottom.
# We will match the entire block starting from "/* 3. 데이터 시각화 차트 및 히트맵 래퍼 */" to the end of the file,
# and rewrite it correctly.

start_idx = content.find("/* 3. 데이터 시각화 차트 및 히트맵 래퍼 */")
if start_idx != -1:
    content = content[:start_idx]

correct_css = """/* 3. 데이터 시각화 차트 및 히트맵 래퍼 */
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
    flex: 1 1 100%;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow-sm);
}
.heatmap-grid {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 8px;
    margin-top: 20px;
}
.heatmap-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
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

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(content + correct_css)

print("style.css cleanly fixed")
