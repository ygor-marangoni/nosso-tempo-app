'use client';

import { useMemo, useState } from 'react';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const WEEKS_COUNT = 17;

function toYMD(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fmtHours(h) {
  if (!h || h === 0) return 'Nenhum registro';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}min juntos`;
  if (mins === 0) return `${hrs}h juntos`;
  return `${hrs}h ${mins}min juntos`;
}

function getIntensity(hours) {
  if (!hours || hours === 0) return 0;
  if (hours < 1) return 1;
  if (hours < 3) return 2;
  if (hours < 5) return 3;
  return 4;
}

export default function ActivityHeatmap({ entries }) {
  const [tooltip, setTooltip] = useState(null);

  const weeks = useMemo(() => {
    const totalsByDate = entries.reduce((acc, e) => {
      acc[e.date] = (acc[e.date] || 0) + e.hours;
      return acc;
    }, {});

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    // Align start to the Sunday of (WEEKS_COUNT weeks ago)
    const start = new Date(today);
    start.setDate(today.getDate() - (WEEKS_COUNT * 7 - 1));
    start.setDate(start.getDate() - start.getDay());

    const result = [];
    const cur = new Date(start);

    for (let w = 0; w < WEEKS_COUNT; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(cur);
        date.setDate(cur.getDate() + d);
        date.setHours(12, 0, 0, 0);
        const ymd = toYMD(date);
        const isFuture = date > today;
        week.push({ date, ymd, isFuture, hours: isFuture ? null : (totalsByDate[ymd] ?? 0) });
      }
      result.push(week);
      cur.setDate(cur.getDate() + 7);
    }
    return result;
  }, [entries]);

  return (
    <div className="heatmap-outer">
      <div className="heatmap-scroll">
        <div className="heatmap-inner">

          {/* Day labels column */}
          <div className="heatmap-labels-col">
            <div className="heatmap-month-spacer" />
            {WEEKDAY_LABELS.map((lbl, i) => (
              <div key={lbl} className="heatmap-day-label">
                {i % 2 === 1 ? lbl : ''}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => {
            let monthLabel = '';
            for (const cell of week) {
              if (!cell.isFuture && cell.date.getDate() <= 7) {
                const prevFirst = wi > 0 ? weeks[wi - 1][0].date : null;
                if (!prevFirst || prevFirst.getMonth() !== cell.date.getMonth()) {
                  monthLabel = MONTHS_PT[cell.date.getMonth()];
                }
                break;
              }
            }

            return (
              <div key={wi} className="heatmap-week-col">
                <div className="heatmap-month-label">{monthLabel}</div>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className={`heatmap-cell${cell.isFuture ? ' heatmap-cell-future' : ''}`}
                    data-intensity={cell.isFuture ? undefined : getIntensity(cell.hours)}
                    onMouseEnter={e => {
                      if (cell.isFuture) return;
                      setTooltip({
                        date: cell.date.toLocaleDateString('pt-BR', {
                          weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                        }),
                        hours: cell.hours,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span>Menos</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="heatmap-legend-cell" data-intensity={i} />
          ))}
          <span>Mais</span>
        </div>
      </div>

      {/* Fixed tooltip */}
      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{ left: tooltip.x + 14, top: tooltip.y - 60, pointerEvents: 'none' }}
        >
          <span className="heatmap-tt-date">{tooltip.date}</span>
          <span className="heatmap-tt-val">{fmtHours(tooltip.hours)}</span>
        </div>
      )}
    </div>
  );
}
