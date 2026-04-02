'use client';

import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const YEARS_PER_PAGE = 16;

function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(ymd) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-');
  return `${d}/${m}/${y}`;
}

export default function AppDatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  className = '',
}) {
  const today = new Date();
  const todayYMD = toYMD(today);
  const parsed = value ? new Date(`${value}T12:00:00`) : null;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const [view, setView] = useState('days');
  const [yearPageStart, setYearPageStart] = useState(() => {
    const base = parsed?.getFullYear() ?? today.getFullYear();
    return Math.floor(base / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  });

  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setView('days');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  useEffect(() => {
    if (value) {
      const p = new Date(`${value}T12:00:00`);
      setViewYear(p.getFullYear());
      setViewMonth(p.getMonth());
    }
  }, [value]);

  function handlePrev() {
    if (view === 'days') {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
      else setViewMonth(m => m - 1);
    } else if (view === 'months') {
      setViewYear(y => y - 1);
    } else {
      setYearPageStart(s => s - YEARS_PER_PAGE);
    }
  }

  function handleNext() {
    if (view === 'days') {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
      else setViewMonth(m => m + 1);
    } else if (view === 'months') {
      setViewYear(y => y + 1);
    } else {
      setYearPageStart(s => s + YEARS_PER_PAGE);
    }
  }

  function openYearView() {
    setYearPageStart(Math.floor(viewYear / YEARS_PER_PAGE) * YEARS_PER_PAGE);
    setView('years');
  }

  function handleMonthSelect(m) {
    setViewMonth(m);
    setView('days');
  }

  function handleYearSelect(y) {
    setViewYear(y);
    setView('months');
  }

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startOffset = firstDay.getDay();
    const cells = [];

    const prevLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ date: new Date(prevY, prevM, prevLastDay - i), current: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push({ date: new Date(viewYear, viewMonth, d), current: true });
    }
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      for (let d = 1; d <= remaining; d++) {
        cells.push({ date: new Date(nextY, nextM, d), current: false });
      }
    }
    return cells;
  }, [viewYear, viewMonth]);

  function handleDay(cell) {
    const ymd = toYMD(cell.date);
    onChange(ymd);
    setOpen(false);
    setView('days');
    if (!cell.current) {
      setViewYear(cell.date.getFullYear());
      setViewMonth(cell.date.getMonth());
    }
  }

  function handleClear() {
    onChange('');
    setOpen(false);
    setView('days');
  }

  function handleToday() {
    onChange(todayYMD);
    setOpen(false);
    setView('days');
  }

  const selectedYear = parsed?.getFullYear();
  const selectedMonth = parsed?.getMonth();

  return (
    <div className={`adp-wrap ${className}`} ref={wrapRef}>
      <button
        type="button"
        className={`adp-trigger${value ? ' adp-has-value' : ''}${open ? ' adp-open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <Calendar size={15} className="adp-trigger-icon" />
        <span className="adp-trigger-text">
          {value ? formatDisplay(value) : placeholder}
        </span>
        <ChevronDown size={14} className={`adp-trigger-chevron${open ? ' adp-chevron-up' : ''}`} />
      </button>

      {open && (
        <div className="adp-popover dp-wrap">
          <div className="dp-header">
            <button className="dp-nav-btn" onClick={handlePrev} type="button">
              <ChevronLeft size={15} />
            </button>

            {view === 'days' && (
              <div className="dp-header-labels">
                <button className="dp-label-btn" onClick={() => setView('months')} type="button">
                  {MONTHS_PT[viewMonth]}
                </button>
                <button className="dp-label-btn" onClick={openYearView} type="button">
                  {viewYear}
                </button>
              </div>
            )}
            {view === 'months' && (
              <button className="dp-label-btn" onClick={openYearView} type="button">
                {viewYear}
              </button>
            )}
            {view === 'years' && (
              <span className="dp-label-range">
                {yearPageStart} – {yearPageStart + YEARS_PER_PAGE - 1}
              </span>
            )}

            <button className="dp-nav-btn" onClick={handleNext} type="button">
              <ChevronRight size={15} />
            </button>
          </div>

          {view === 'days' && (
            <>
              <div className="dp-weekdays">
                {WEEKDAYS_PT.map(day => <span key={day}>{day}</span>)}
              </div>
              <div className="dp-grid">
                {days.map((cell, i) => {
                  const ymd = toYMD(cell.date);
                  const selected = value === ymd;
                  const isToday = ymd === todayYMD;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={[
                        'dp-day',
                        !cell.current ? 'dp-other' : '',
                        selected ? 'dp-selected' : '',
                        isToday ? 'dp-today' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleDay(cell)}
                    >
                      {cell.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view === 'months' && (
            <div className="dp-month-grid">
              {MONTHS_SHORT.map((name, m) => (
                <button
                  key={m}
                  type="button"
                  className={[
                    'dp-month-cell',
                    m === viewMonth ? 'dp-cell-current' : '',
                    selectedYear === viewYear && selectedMonth === m ? 'dp-cell-selected' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleMonthSelect(m)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {view === 'years' && (
            <div className="dp-year-grid">
              {Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPageStart + i).map(y => (
                <button
                  key={y}
                  type="button"
                  className={[
                    'dp-year-cell',
                    y === viewYear ? 'dp-cell-current' : '',
                    y === selectedYear ? 'dp-cell-selected' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleYearSelect(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          <div className="adp-footer">
            <button type="button" className="adp-footer-btn" onClick={handleClear}>
              Limpar
            </button>
            <button type="button" className="adp-footer-btn adp-footer-today" onClick={handleToday}>
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
