'use client';

import { ChevronDown, Clock3 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

function isValidTime(value) {
  return /^\d{2}:\d{2}$/.test(value || '');
}

function formatTypingValue(rawValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, -2)}:${digits.slice(-2)}`;
}

function normalizeTime(rawValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 4);
  if (!digits) return '';

  let hourDigits = '';
  let minuteDigits = '';

  if (digits.length <= 2) {
    hourDigits = digits;
    minuteDigits = '00';
  } else if (digits.length === 3) {
    hourDigits = digits.slice(0, 1);
    minuteDigits = digits.slice(1);
  } else {
    hourDigits = digits.slice(0, 2);
    minuteDigits = digits.slice(2);
  }

  const hour = Math.min(23, Number(hourDigits || 0));
  const minute = Math.min(59, Number(minuteDigits || 0));

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function AppTimePicker({
  value,
  onChange,
  placeholder = '--:--',
  className = '',
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const hoursListRef = useRef(null);
  const minutesListRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [draftValue, setDraftValue] = useState(value || '');

  const hour = useMemo(() => (isValidTime(value) ? value.slice(0, 2) : ''), [value]);
  const minute = useMemo(() => (isValidTime(value) ? value.slice(3, 5) : ''), [value]);

  useEffect(() => {
    setDraftValue(value || '');
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;

    function handleOutside(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKey(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const frame = requestAnimationFrame(() => {
      const hourTarget = hoursListRef.current?.querySelector(`[data-value="${hour || '00'}"]`);
      const minuteTarget = minutesListRef.current?.querySelector(`[data-value="${minute || '00'}"]`);

      if (hourTarget && hoursListRef.current) {
        hoursListRef.current.scrollTop = Math.max(0, hourTarget.offsetTop - 54);
      }

      if (minuteTarget && minutesListRef.current) {
        minutesListRef.current.scrollTop = Math.max(0, minuteTarget.offsetTop - 54);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [open, hour, minute]);

  function commitValue(nextValue) {
    setDraftValue(nextValue);
    onChange(nextValue);
  }

  function updateTime(nextHour, nextMinute) {
    const safeHour = nextHour ?? hour ?? '00';
    const safeMinute = nextMinute ?? minute ?? '00';
    commitValue(`${safeHour || '00'}:${safeMinute || '00'}`);
  }

  function handleInputChange(event) {
    const nextDisplay = formatTypingValue(event.target.value);
    setDraftValue(nextDisplay);

    const normalized = normalizeTime(nextDisplay);
    if (normalized && nextDisplay.replace(/\D/g, '').length === 4) {
      onChange(normalized);
    }

    if (!nextDisplay) {
      onChange('');
    }
  }

  function handleInputBlur() {
    const normalized = normalizeTime(draftValue);
    if (!draftValue) {
      commitValue('');
      return;
    }
    commitValue(normalized);
  }

  function handleNow() {
    const now = new Date();
    const nextHour = String(now.getHours()).padStart(2, '0');
    const nextMinute = String(now.getMinutes()).padStart(2, '0');
    commitValue(`${nextHour}:${nextMinute}`);
    setOpen(false);
  }

  function handleClear() {
    commitValue('');
    setOpen(false);
  }

  function handleTriggerMouseDown(event) {
    if (event.target.closest('.atp-toggle')) return;
    if (event.target === inputRef.current) return;

    event.preventDefault();
    setOpen(true);
    inputRef.current?.focus();
  }

  return (
    <div className={`atp-wrap ${className}`.trim()} ref={wrapRef}>
      <div
        className={`atp-trigger${draftValue ? ' atp-has-value' : ''}${open ? ' atp-open' : ''}`}
        onMouseDown={handleTriggerMouseDown}
      >
        <Clock3 size={15} className="atp-trigger-icon" />
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          className="atp-input"
          value={draftValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          aria-label="Horário"
        />
        <button
          type="button"
          className="atp-toggle"
          onClick={() => setOpen(current => !current)}
          aria-label="Abrir seletor de horário"
        >
          <ChevronDown size={14} className={`atp-trigger-chevron${open ? ' atp-chevron-up' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="atp-popover dp-wrap">
          <div className="atp-header">
            <span className="atp-header-label">Selecione um horário</span>
          </div>

          <div className="atp-columns">
            <div className="atp-column">
              <div className="atp-column-title">Hora</div>
              <div className="atp-option-list" ref={hoursListRef}>
                {HOURS.map(item => (
                  <button
                    key={item}
                    type="button"
                    className={`atp-option${item === hour ? ' atp-option-selected' : ''}`}
                    data-value={item}
                    onClick={() => updateTime(item, minute || '00')}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="atp-column-separator" />

            <div className="atp-column">
              <div className="atp-column-title">Min</div>
              <div className="atp-option-list" ref={minutesListRef}>
                {MINUTES.map(item => (
                  <button
                    key={item}
                    type="button"
                    className={`atp-option${item === minute ? ' atp-option-selected' : ''}`}
                    data-value={item}
                    onClick={() => updateTime(hour || '00', item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="adp-footer">
            <button type="button" className="adp-footer-btn" onClick={handleClear}>
              Limpar
            </button>
            <button type="button" className="adp-footer-btn adp-footer-today" onClick={handleNow}>
              Agora
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
