'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  CalendarCheck,
  Clock,
  Flame,
  Sparkles,
  Star,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import ReportsCharts from '@/components/reports/ReportsCharts';
import { useCouple } from '@/contexts/CoupleContext';
import { formatTime } from '@/lib/dateUtils';

const ShareRecapModal = dynamic(
  () => import('@/components/share/ShareRecapModal'),
  { ssr: false }
);

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ReportsPage() {
  const { entries, entriesReady, ensureEntriesLoaded } = useCouple();
  const [showRecap, setShowRecap] = useState(false);

  useEffect(() => {
    ensureEntriesLoaded();
  }, [ensureEntriesLoaded]);

  const stats = useMemo(() => {
    if (!entries.length) return [];

    const now = new Date();
    now.setHours(12, 0, 0, 0);

    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    const distinctDates = [...new Set(entries.map(entry => entry.date))];
    const totalDays = distinctDates.length;
    const avgPerSession = totalDays > 0 ? totalHours / totalDays : 0;

    const byDate = entries.reduce((acc, entry) => {
      acc[entry.date] = (acc[entry.date] || 0) + entry.hours;
      return acc;
    }, {});

    const bestDayEntry = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0];
    const bestDayHours = bestDayEntry?.[1] || 0;
    const bestDayLabel = bestDayEntry
      ? new Date(`${bestDayEntry[0]}T12:00:00`).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        })
      : null;

    const sortedDesc = [...distinctDates].sort().reverse();
    const todayKey = toKey(now);

    let streak = 0;
    const cursor = new Date(now);
    if (!distinctDates.includes(todayKey)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    for (const date of sortedDesc) {
      if (date === toKey(cursor)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (date < toKey(cursor)) {
        break;
      }
    }

    const sortedAsc = [...distinctDates].sort();
    let bestStreak = sortedAsc.length > 0 ? 1 : 0;
    let run = 1;

    for (let index = 1; index < sortedAsc.length; index += 1) {
      const prev = new Date(`${sortedAsc[index - 1]}T12:00:00`);
      const curr = new Date(`${sortedAsc[index]}T12:00:00`);
      const diff = Math.round((curr - prev) / 86_400_000);

      if (diff === 1) {
        run += 1;
        if (run > bestStreak) bestStreak = run;
      } else {
        run = 1;
      }
    }

    return [
      {
        icon: <Clock size={18} />,
        label: 'Total de horas',
        value: formatTime(totalHours),
        sub: `em ${totalDays} dia${totalDays !== 1 ? 's' : ''}`,
      },
      {
        icon: <CalendarCheck size={18} />,
        label: 'Dias registrados',
        value: String(totalDays),
        sub: 'dias juntos',
      },
      {
        icon: <TrendingUp size={18} />,
        label: 'Média por encontro',
        value: formatTime(avgPerSession),
        sub: 'por dia registrado',
      },
      {
        icon: <Flame size={18} />,
        label: 'Sequência atual',
        value: String(streak),
        sub: `dia${streak !== 1 ? 's' : ''} seguido${streak !== 1 ? 's' : ''}`,
      },
      {
        icon: <Trophy size={18} />,
        label: 'Melhor sequência',
        value: String(bestStreak),
        sub: `dia${bestStreak !== 1 ? 's' : ''} consecutivo${bestStreak !== 1 ? 's' : ''}`,
      },
      {
        icon: <Star size={18} />,
        label: 'Melhor dia',
        value: bestDayHours > 0 ? formatTime(bestDayHours) : '-',
        sub: bestDayLabel ?? 'sem dados',
      },
    ];
  }, [entries]);

  const hasData = entriesReady && entries.length > 0;

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1>Relatórios</h1>
          <p>
            <BarChart3 size={14} color="var(--rosa-400)" />
            Visualize como vocês aproveitam o tempo juntos
          </p>
        </div>

        <button
          className="recap-trigger-btn recap-trigger-btn--reports"
          onClick={() => setShowRecap(true)}
          style={{ marginTop: 6 }}
        >
          <Sparkles size={14} />
          Recap do Mês
        </button>
      </div>

      {hasData && (
        <div className="report-stats-grid">
          {stats.map(item => (
            <div className="rstat-card" key={item.label}>
              <div className="rstat-icon">{item.icon}</div>
              <div className="rstat-body">
                <div className="rstat-label">{item.label}</div>
                <div className="rstat-value-row">
                  <div className="rstat-value">{item.value}</div>
                  {item.sub && <div className="rstat-sub">{item.sub}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRecap && <ShareRecapModal onClose={() => setShowRecap(false)} />}

      {!entriesReady ? (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <div className="empty-icon"><Calendar size={38} /></div>
          <h3>Carregando relatórios</h3>
          <p>Estamos preparando os dados de vocês.</p>
        </div>
      ) : entries.length > 0 ? (
        <ReportsCharts entries={entries} />
      ) : (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <div className="empty-icon"><Calendar size={38} /></div>
          <h3>Nenhum dado ainda</h3>
          <p>Registrem momentos para ver os relatórios aqui.</p>
        </div>
      )}
    </div>
  );
}
