'use client';

import { memo, useMemo, useState } from 'react';
import { Activity, CalendarDays, Target } from 'lucide-react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { formatTime } from '@/lib/dateUtils';
import { normalizeActivities, normalizeTagName } from '@/lib/tagConfig';
import { useTheme } from '@/contexts/ThemeContext';

Chart.register(LineElement, BarElement, ArcElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

const PERIOD_OPTIONS = [
  { id: '7d',  label: '7 dias'  },
  { id: '30d', label: '30 dias' },
  { id: '3m',  label: '3 meses' },
  { id: 'all', label: 'Tudo'    },
];

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const n = clean.length === 3 ? clean.split('').map(c => `${c}${c}`).join('') : clean;
  const v = Number.parseInt(n, 16);
  return `${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}`;
}

function readCssColor(varName, fallback) {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
}

function ReportsCharts({ entries }) {
  const theme = useTheme();
  const palette = theme?.palette || 'rosa';
  const [period, setPeriod] = useState('30d');

  const {
    font,
    rose600, rose500, rose400, rose300, rose200, rose800,
    text, textMuted, textLight, border,
    fillSoft, fillStrong, donutColors,
    chartData, last7, topActivities,
    tooltipDefaults,
  } = useMemo(() => {
    const nextFont = {
      family: typeof window !== 'undefined'
        ? getComputedStyle(document.body).fontFamily || 'sans-serif'
        : 'sans-serif',
    };
    const r600 = readCssColor('--rosa-600', '#ef5087');
    const r500 = readCssColor('--rosa-500', '#ff7a9c');
    const r400 = readCssColor('--rosa-400', '#ffa0b8');
    const r300 = readCssColor('--rosa-300', '#df99aa');
    const r200 = readCssColor('--rosa-200', '#ffdce5');
    const r800 = readCssColor('--rosa-800', '#a82d57');
    const nextText      = readCssColor('--text',       '#3d2233');
    const nextMuted     = readCssColor('--text-muted', '#ad8999');
    const nextLight     = readCssColor('--text-light', '#7a5468');
    const nextBorder    = readCssColor('--border',     '#f2dae2');

    const today = new Date();
    const totalsByDate = entries.reduce((acc, e) => {
      acc[e.date] = (acc[e.date] || 0) + e.hours;
      return acc;
    }, {});
    const activityCount = entries.reduce((acc, e) => {
      normalizeActivities(e.activities || []).forEach(activity => {
        const label = normalizeTagName(activity);
        acc[label] = (acc[label] || 0) + 1;
      });
      return acc;
    }, {});

    // Chart days based on period
    let chartDays;
    if (period === 'all') {
      const allDates = entries.map(e => e.date).sort();
      chartDays = allDates.length === 0
        ? 30
        : Math.max(30, Math.ceil((today - new Date(`${allDates[0]}T12:00:00`)) / 86_400_000) + 1);
    } else {
      chartDays = { '7d': 7, '30d': 30, '3m': 90 }[period];
    }

    const nextChartData = Array.from({ length: chartDays }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (chartDays - 1 - i));
      return {
        h: totalsByDate[toKey(date)] || 0,
        l: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      };
    });

    const nextLast7 = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return {
        h: totalsByDate[toKey(date)] || 0,
        l: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      };
    });

    const nextTopActivities = Object.entries(activityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      font: nextFont,
      rose600: r600, rose500: r500, rose400: r400,
      rose300: r300, rose200: r200, rose800: r800,
      text: nextText, textMuted: nextMuted, textLight: nextLight, border: nextBorder,
      fillSoft:    `rgba(${hexToRgb(r600)}, 0.08)`,
      fillStrong:  `rgba(${hexToRgb(r600)}, 0.55)`,
      donutColors: [r600, r500, r400, r300, r200, r800],
      chartData:   nextChartData,
      last7:       nextLast7,
      topActivities: nextTopActivities,
      tooltipDefaults: {
        backgroundColor: nextText,
        bodyFont: nextFont,
        cornerRadius: 10,
        padding: 12,
        titleFont: nextFont,
      },
    };
  }, [entries, palette, period]);

  const tickStep = chartData.length > 60 ? 7 : chartData.length > 20 ? 3 : 1;

  return (
    <div className="reports-grid" key={palette}>

      {/* Line chart with period filter */}
      <div className="chart-card full-width">
        <div className="chart-card-header">
          <div className="chart-title">
            <Activity size={13} />
            Horas por dia
          </div>
          <div className="period-filter">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`period-btn${period === opt.id ? ' active' : ''}`}
                onClick={() => setPeriod(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-container tall">
          <Line
            data={{
              labels: chartData.map(d => d.l),
              datasets: [{
                backgroundColor: fillSoft,
                borderColor: rose600,
                borderWidth: 2.5,
                data: chartData.map(d => d.h),
                fill: true,
                pointBackgroundColor: rose600,
                pointBorderColor: '#fff',
                pointBorderWidth: 1.5,
                pointHoverRadius: 5,
                pointRadius: chartData.length > 60 ? 0 : 2.5,
                tension: 0.4,
              }],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...tooltipDefaults,
                  callbacks: { label: ctx => ` ${formatTime(ctx.parsed.y)} juntos` },
                },
              },
              responsive: true,
              scales: {
                x: {
                  grid: { display: false },
                  ticks: {
                    color: textMuted,
                    font: { ...font, size: 10 },
                    maxRotation: 0,
                    callback: (_, i) => i % tickStep === 0 ? chartData[i]?.l : '',
                  },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: `rgba(${hexToRgb(border)}, 0.6)` },
                  ticks: { color: textMuted, font: { ...font, size: 11 } },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Doughnut — atividades */}
      {topActivities.length > 0 && (
        <div className="chart-card">
          <div className="chart-title">
            <Target size={13} />
            Atividades favoritas
          </div>
          <div className="chart-container">
            <Doughnut
              data={{
                labels: topActivities.map(d => d[0]),
                datasets: [{
                  backgroundColor: donutColors,
                  borderColor: '#fff',
                  borderWidth: 3,
                  data: topActivities.map(d => d[1]),
                  hoverOffset: 6,
                }],
              }}
              options={{
                cutout: '62%',
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: textLight,
                      font: { ...font, size: 11 },
                      padding: 10,
                      pointStyleWidth: 13,
                      pointStyle: 'rectRounded',
                      usePointStyle: true,
                    },
                    position: 'bottom',
                  },
                  tooltip: tooltipDefaults,
                },
                responsive: true,
              }}
            />
          </div>
        </div>
      )}

      {/* Bar chart — esta semana */}
      <div className="chart-card">
        <div className="chart-title">
          <CalendarDays size={13} />
          Esta semana
        </div>
        <div className="chart-container">
          <Bar
            data={{
              labels: last7.map(d => d.l),
              datasets: [{
                backgroundColor: fillStrong,
                borderRadius: 8,
                borderSkipped: false,
                data: last7.map(d => d.h),
              }],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...tooltipDefaults,
                  callbacks: { label: ctx => ` ${formatTime(ctx.parsed.y)} juntos` },
                },
              },
              responsive: true,
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: textLight, font: { ...font, size: 12, weight: 500 } },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: `rgba(${hexToRgb(border)}, 0.6)` },
                  ticks: { color: textMuted, font: { ...font, size: 11 } },
                },
              },
            }}
          />
        </div>
      </div>

    </div>
  );
}

export default memo(ReportsCharts);
