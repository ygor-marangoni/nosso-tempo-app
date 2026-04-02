'use client';

import { useEffect, useMemo } from 'react';
import { BarChart3, Calendar, CalendarCheck, Clock, Flame, Star, Trophy, TrendingUp } from 'lucide-react';
import ReportsCharts from '@/components/reports/ReportsCharts';
import { useCouple } from '@/contexts/CoupleContext';
import { formatTime } from '@/lib/dateUtils';

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ReportsPage() {
  const { entries, entriesReady, ensureEntriesLoaded } = useCouple();

  useEffect(() => {
    ensureEntriesLoaded();
  }, [ensureEntriesLoaded]);

  const stats = useMemo(() => {
    if (!entries.length) return [];

    const now = new Date();
    now.setHours(12, 0, 0, 0);

    // Total hours
    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);

    // Distinct dates
    const distinctDates = [...new Set(entries.map(e => e.date))];
    const totalDays = distinctDates.length;

    // Average hours per session (days with entry)
    const avgPerSession = totalDays > 0 ? totalHours / totalDays : 0;

    // Best single day
    const byDate = entries.reduce((acc, e) => {
      acc[e.date] = (acc[e.date] || 0) + e.hours;
      return acc;
    }, {});
    const bestDayEntry = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0];
    const bestDayHours = bestDayEntry?.[1] || 0;
    const bestDayLabel = bestDayEntry
      ? new Date(`${bestDayEntry[0]}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      : null;

    // Best weekday
    const dayTotals = entries.reduce((acc, e) => {
      const idx = new Date(`${e.date}T12:00:00`).getDay();
      acc[idx] = (acc[idx] || 0) + e.hours;
      return acc;
    }, {});
    const bestDayIndex = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Current streak (fixed: don't penalise for today having no entry yet)
    const sortedDesc = [...distinctDates].sort().reverse();
    const todayKey = toKey(now);

    let streak = 0;
    const cursor = new Date(now);
    if (!distinctDates.includes(todayKey)) {
      cursor.setDate(cursor.getDate() - 1);
    }
    for (const date of sortedDesc) {
      if (date === toKey(cursor)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (date < toKey(cursor)) {
        break;
      }
    }

    // Best streak (all-time)
    const sortedAsc = [...distinctDates].sort();
    let bestStreak = sortedAsc.length > 0 ? 1 : 0;
    let run = 1;
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(`${sortedAsc[i - 1]}T12:00:00`);
      const curr = new Date(`${sortedAsc[i]}T12:00:00`);
      const diff = Math.round((curr - prev) / 86_400_000);
      if (diff === 1) { run++; if (run > bestStreak) bestStreak = run; }
      else { run = 1; }
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
      <div className="page-header">
        <h1>Relatórios</h1>
        <p>
          <BarChart3 size={14} color="var(--rosa-400)" />
          Visualize como vocês aproveitam o tempo juntos
        </p>
      </div>

      {/* Stats grid */}
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
