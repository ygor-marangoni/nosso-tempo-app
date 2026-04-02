'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Clock, FileText, Heart, Pencil, Plus, Sparkles } from 'lucide-react';
import { useCouple } from '@/contexts/CoupleContext';
import { useToast } from '@/contexts/ToastContext';
import AppDatePicker from '@/components/common/AppDatePicker';
import LucideIcon from '@/components/common/LucideIcon';
import { ICON_OPTIONS, allTags, tagIcon } from '@/lib/tagConfig';
import { todayLocalDate } from '@/lib/dateUtils';

export default function RegisterPage() {
  const router = useRouter();
  const iconPickerRef = useRef(null);
  const { config, addCustomTag, addEntry } = useCouple();
  const { showToast } = useToast();
  const customTags = useMemo(() => config.customTags || [], [config.customTags]);
  const tags = useMemo(() => allTags(customTags), [customTags]);

  const [date, setDate] = useState(todayLocalDate);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState([]);
  const [customActivity, setCustomActivity] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('sparkles');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!iconPickerRef.current?.contains(event.target)) {
        setIconPickerOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIconPickerOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function toggleTag(tag) {
    setSelected(current => (current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag]));
  }

  async function addCustomActivity() {
    const value = customActivity.trim();
    if (!value) return;

    try {
      await addCustomTag({ name: value, icon: selectedIcon });
      if (!selected.includes(value)) setSelected(current => [...current, value]);
      setCustomActivity('');
      setSelectedIcon('sparkles');
      setIconPickerOpen(false);
    } catch {
      showToast('Não foi possível adicionar a atividade personalizada.');
    }
  }

  async function save() {
    const parsedHours = Number.parseInt(hours || '0', 10) || 0;
    const parsedMinutes = Number.parseInt(minutes || '0', 10) || 0;
    const totalHours = parsedHours + parsedMinutes / 60;
    let valid = true;

    if (!date) {
      setDateError(true);
      valid = false;
    }

    if (totalHours <= 0) {
      setTimeError(true);
      valid = false;
    }

    if (!valid) {
      showToast('Preencha a data e o tempo juntos.');
      return;
    }

    setSaving(true);

    try {
      await addEntry({
        activities: selected,
        date,
        hours: totalHours,
        note,
      });

      setDate(todayLocalDate());
      setHours('');
      setMinutes('');
      setNote('');
      setSelected([]);
      setCustomActivity('');
      setSelectedIcon('sparkles');
      setIconPickerOpen(false);
      setDateError(false);
      setTimeError(false);
      showToast('Momento salvo com sucesso.');
    } catch {
      showToast('Não foi possível salvar esse momento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Registrar Momento</h1>
        <p>
          <Pencil size={14} color="var(--rosa-400)" /> Adicione as horas que vocês passaram juntos
        </p>
      </div>

      <div className="card">
        <div className="form-grid">
          <div>
            <label>
              <span className="label-icon">
                <Calendar size={13} />
              </span>
              Data
            </label>
            <AppDatePicker
              value={date}
              onChange={val => { setDate(val); setDateError(false); }}
              className={dateError ? 'adp-error' : ''}
            />
          </div>

          <div>
            <label>
              <span className="label-icon">
                <Clock size={13} />
              </span>
              Tempo juntos
            </label>
            <div className="time-input-row">
              <input
                type="number"
                min="0"
                max="23"
                placeholder="Horas"
                value={hours}
                onChange={event => {
                  setHours(event.target.value);
                  setTimeError(false);
                }}
                className={timeError ? 'input-error' : ''}
              />
              <span className="time-sep">h</span>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="Min"
                value={minutes}
                onChange={event => {
                  setMinutes(event.target.value);
                  setTimeError(false);
                }}
                className={timeError ? 'input-error' : ''}
              />
              <span className="time-sep">min</span>
            </div>
          </div>

          <div className="form-full">
            <label>
              <span className="label-icon">
                <Sparkles size={13} />
              </span>
              O que vocês fizeram?
            </label>
            <div className="preset-tags">
              {tags.map(tag => (
                <span
                  key={tag}
                  className={`tag${selected.includes(tag) ? ' selected' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  <span className="tag-icon">
                    <LucideIcon name={tagIcon(tag, customTags)} size={13} />
                  </span>
                  {tag}
                </span>
              ))}
            </div>

            <div className="icon-picker-area" ref={iconPickerRef}>
              <div className="tag-input-row">
                <button className={`icon-picker-btn${iconPickerOpen ? ' active' : ''}`} type="button" onClick={() => setIconPickerOpen(open => !open)}>
                  <LucideIcon name={selectedIcon} size={16} />
                </button>
                <input
                  type="text"
                  placeholder="Nova atividade..."
                  value={customActivity}
                  onChange={event => setCustomActivity(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addCustomActivity();
                    }
                  }}
                />
                <button className="btn btn-secondary btn-sm tag-add-btn" onClick={addCustomActivity}>
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>

              {iconPickerOpen && (
                <div className="icon-picker-popup show">
                  <div className="icon-picker-title">Escolha um ícone</div>
                  <div className="icon-grid">
                    {ICON_OPTIONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-option${selectedIcon === icon ? ' selected' : ''}`}
                        onClick={() => {
                          setSelectedIcon(icon);
                          setIconPickerOpen(false);
                        }}
                      >
                        <LucideIcon name={icon} size={18} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-full">
            <label>
              <span className="label-icon">
                <FileText size={13} />
              </span>
              Observação <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span>
            </label>
            <textarea
              value={note}
              onChange={event => setNote(event.target.value)}
              placeholder="Algo especial que queira lembrar..."
            />
          </div>
        </div>

        <div className="form-actions register-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : (
              <>
                <Heart size={15} />
                Salvar Momento
              </>
            )}
          </button>
          <button className="btn btn-secondary" onClick={() => router.push('/app/history')}>
            <BookOpen size={15} />
            Ver Histórico
          </button>
        </div>
      </div>
    </div>
  );
}
