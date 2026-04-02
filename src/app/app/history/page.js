'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Calendar, Check, ChevronDown, Clock, FileText, Pencil, Plus, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useCouple } from '@/contexts/CoupleContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import AppDatePicker from '@/components/common/AppDatePicker';
import LayerPortal from '@/components/common/LayerPortal';
import LucideIcon from '@/components/common/LucideIcon';
import { formatTime, MONTHS_SHORT_PT } from '@/lib/dateUtils';
import { allTags, normalizeActivities, normalizeTagName, tagIcon } from '@/lib/tagConfig';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'week', label: 'Esta Semana' },
  { id: 'month', label: 'Este Mês' },
];

export default function HistoryPage() {
  const { entries, entriesReady, config, ensureEntriesLoaded, updateEntry, removeEntry } = useCouple();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const categoryMenuRef = useRef(null);
  const customTags = useMemo(() => config.customTags || [], [config.customTags]);
  const tags = useMemo(() => allTags(customTags), [customTags]);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editMinutes, setEditMinutes] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editSelected, setEditSelected] = useState([]);
  const [editCustomActivity, setEditCustomActivity] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensureEntriesLoaded();
  }, [ensureEntriesLoaded]);

  const timeFilteredEntries = useMemo(() => {
    const now = new Date();
    let items = [...entries];

    if (filter === 'week') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      items = items.filter(entry => new Date(`${entry.date}T12:00:00`) >= lastWeek);
    } else if (filter === 'month') {
      items = items.filter(entry => {
        const date = new Date(`${entry.date}T12:00:00`);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
    }

    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, filter]);

  const categoryCounts = useMemo(() => {
    const counts = new Map();

    entries.forEach(entry => {
      normalizeActivities(entry.activities || []).forEach(activity => {
        counts.set(activity, (counts.get(activity) || 0) + 1);
      });
    });

    return counts;
  }, [entries]);

  const visibleCategoryCounts = useMemo(() => {
    const counts = new Map();

    timeFilteredEntries.forEach(entry => {
      normalizeActivities(entry.activities || []).forEach(activity => {
        counts.set(activity, (counts.get(activity) || 0) + 1);
      });
    });

    return counts;
  }, [timeFilteredEntries]);

  const categoryOptions = useMemo(() => {
    const orderedTags = allTags(customTags);
    const orderMap = new Map(orderedTags.map((tag, index) => [tag, index]));
    const registeredCustomNames = customTags.map(tag => tag.name);
    const availableTags = new Set([
      ...Array.from(categoryCounts.keys()),
      ...registeredCustomNames,
    ]);

    return Array.from(availableTags)
      .map(name => ({
        count: visibleCategoryCounts.get(name) || 0,
        id: name,
        label: name,
      }))
      .sort((left, right) => {
        const leftIndex = orderMap.has(left.id) ? orderMap.get(left.id) : Number.MAX_SAFE_INTEGER;
        const rightIndex = orderMap.has(right.id) ? orderMap.get(right.id) : Number.MAX_SAFE_INTEGER;

        if (leftIndex !== rightIndex) return leftIndex - rightIndex;
        return left.label.localeCompare(right.label, 'pt-BR');
      });
  }, [categoryCounts, customTags, visibleCategoryCounts]);

  useEffect(() => {
    if (categoryFilter !== 'all' && !categoryOptions.some(option => option.id === categoryFilter)) {
      setCategoryFilter('all');
    }
  }, [categoryFilter, categoryOptions]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!categoryMenuRef.current?.contains(event.target)) {
        setCategoryMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setCategoryMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const filteredEntries = useMemo(() => {
    if (categoryFilter === 'all') return timeFilteredEntries;
    return timeFilteredEntries.filter(entry => normalizeActivities(entry.activities || []).includes(categoryFilter));
  }, [categoryFilter, timeFilteredEntries]);

  const allCategoriesLabel = useMemo(
    () => `Todas as categorias (${timeFilteredEntries.length})`,
    [timeFilteredEntries.length],
  );

  const selectedCategoryOption = useMemo(() => {
    if (categoryFilter === 'all') return { count: timeFilteredEntries.length, id: 'all', label: allCategoriesLabel };
    return categoryOptions.find(option => option.id === categoryFilter) || { count: 0, id: 'all', label: allCategoriesLabel };
  }, [allCategoriesLabel, categoryFilter, categoryOptions, timeFilteredEntries.length]);

  const momentsLabel =
    filteredEntries.length === 1 ? '1 momento guardado' : `${filteredEntries.length} momentos guardados`;

  function startEdit(entry) {
    const totalMinutes = Math.round((entry.hours || 0) * 60);
    setEditingEntry(entry);
    setEditDate(entry.date);
    setEditHours(String(Math.floor(totalMinutes / 60)));
    setEditMinutes(String(totalMinutes % 60));
    setEditNote(entry.note || '');
    setEditSelected(normalizeActivities(entry.activities || []));
    setEditCustomActivity('');
  }

  function closeModal() {
    setEditingEntry(null);
  }

  function toggleEditTag(tag) {
    setEditSelected(current => (current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag]));
  }

  function addEditCustomActivity() {
    const value = editCustomActivity.trim();
    if (!value) return;
    if (!editSelected.includes(value)) setEditSelected(current => [...current, value]);
    setEditCustomActivity('');
  }

  async function saveEdit() {
    const parsedHours = Number.parseInt(editHours || '0', 10) || 0;
    const parsedMinutes = Number.parseInt(editMinutes || '0', 10) || 0;
    const totalHours = parsedHours + parsedMinutes / 60;

    if (!editDate || totalHours <= 0) {
      showToast('Preencha a data e o tempo juntos.');
      return;
    }

    setSaving(true);

    try {
      await updateEntry(editingEntry.id, {
        activities: editSelected,
        date: editDate,
        hours: totalHours,
        note: editNote,
      });
      closeModal();
      showToast('Momento atualizado.');
    } catch {
      showToast('Não foi possível atualizar esse momento.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(entry) {
    showConfirm('Deseja remover este momento?', async () => {
      try {
        await removeEntry(entry.id);
        showToast('Registro removido.');
      } catch {
        showToast('Não foi possível remover o registro.');
      }
    });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Nosso Histórico</h1>
        <p>
          <BookOpen size={14} color="var(--rosa-400)" /> Todos os momentos compartilhados
        </p>
      </div>

      <div className="card history-filter-panel">
        <div className="history-filter-bar">
          <div className="history-filter-title">
            <SlidersHorizontal size={14} /> Filtrar
          </div>

          <div className="history-filters">
            {FILTERS.map(item => (
              <button
                key={item.id}
                className={`filter-chip${filter === item.id ? ' active' : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="history-select-inline">
            <div className={`history-select-wrap${categoryMenuOpen ? ' open' : ''}`} ref={categoryMenuRef}>
              <button
                type="button"
                className="history-select-button"
                aria-haspopup="listbox"
                aria-expanded={categoryMenuOpen}
                onClick={() => setCategoryMenuOpen(open => !open)}
              >
                <span className="history-select-button-label">{selectedCategoryOption.label}</span>
                <ChevronDown size={16} className="history-select-chevron" />
              </button>

              {categoryMenuOpen && (
                <div className="history-select-menu" role="listbox" aria-label="Filtrar por categoria">
                  <button
                    type="button"
                    role="option"
                    aria-selected={categoryFilter === 'all'}
                    className={`history-select-option${categoryFilter === 'all' ? ' active' : ''}`}
                    onClick={() => {
                      setCategoryFilter('all');
                      setCategoryMenuOpen(false);
                    }}
                  >
                    <span className="history-select-option-copy">
                      <span className="history-select-option-title">Todas as categorias</span>
                    </span>
                    <span className="history-select-option-meta">
                      <span className="history-select-option-count">{timeFilteredEntries.length}</span>
                      {categoryFilter === 'all' && <Check size={14} />}
                    </span>
                  </button>

                  {categoryOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={categoryFilter === option.id}
                      className={`history-select-option${categoryFilter === option.id ? ' active' : ''}`}
                      onClick={() => {
                        setCategoryFilter(option.id);
                        setCategoryMenuOpen(false);
                      }}
                    >
                      <span className="history-select-option-copy">
                        <span className="history-select-option-icon">
                          <LucideIcon name={tagIcon(option.id, customTags)} size={13} />
                        </span>
                        <span className="history-select-option-title">{option.label}</span>
                      </span>
                      <span className="history-select-option-meta">
                        <span className="history-select-option-count">{option.count}</span>
                        {categoryFilter === option.id && <Check size={14} />}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="history-count">{momentsLabel}</div>

      <div className="history-list">
        {!entriesReady ? (
          <div className="empty-state">
            <div className="empty-icon">
              <BookOpen size={38} />
            </div>
            <h3>Carregando histórico</h3>
            <p>Estamos buscando os momentos de vocês.</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <BookOpen size={38} />
            </div>
            <h3>{categoryFilter === 'all' ? 'Nenhum momento encontrado' : 'Nenhum momento nessa categoria'}</h3>
            <p>
              {categoryFilter === 'all'
                ? 'Registrem novos encontros para vê-los aqui.'
                : `Tente outro filtro ou mude o período para encontrar momentos em "${normalizeTagName(categoryFilter)}".`}
            </p>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const date = new Date(`${entry.date}T12:00:00`);

            return (
              <div className="history-card" key={entry.id}>
                <div className="history-date-badge">
                  <div className="day">{date.getDate()}</div>
                  <div className="month">{MONTHS_SHORT_PT[date.getMonth()]}</div>
                </div>

                <div className="history-content">
                  <div className="history-hours">
                    {formatTime(entry.hours)} <span>juntos</span>
                  </div>

                  <div className="history-tags">
                    {(entry.activities || []).map(activity => (
                      <span className="history-tag" key={activity}>
                        <LucideIcon name={tagIcon(activity, customTags)} size={11} />
                        {normalizeTagName(activity)}
                      </span>
                    ))}
                  </div>

                  {entry.note && <div className="history-note">"{entry.note}"</div>}
                  {entry.createdByName && <div className="history-byline">Adicionado por {entry.createdByName}</div>}
                </div>

                <div className="history-actions">
                  <button className="btn-edit" onClick={() => startEdit(entry)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(entry)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {editingEntry && (
        <LayerPortal>
          <div className="modal-overlay show">
            <div className="modal" role="dialog" aria-modal="true">
              <div className="modal-header">
                <h2>Editar momento</h2>
                <button className="modal-close" onClick={closeModal}>
                  <X size={18} />
                </button>
              </div>

              <div className="form-grid">
                <div>
                  <label>
                    <span className="label-icon">
                      <Calendar size={13} />
                    </span>
                    Data
                  </label>
                  <AppDatePicker value={editDate} onChange={setEditDate} />
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
                      placeholder="Horas"
                      value={editHours}
                      onChange={event => setEditHours(event.target.value)}
                    />
                    <span className="time-sep">h</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="Min"
                      value={editMinutes}
                      onChange={event => setEditMinutes(event.target.value)}
                    />
                    <span className="time-sep">min</span>
                  </div>
                </div>

                <div className="form-full">
                  <label>O que vocês fizeram?</label>
                  <div className="preset-tags">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className={`tag${editSelected.includes(tag) ? ' selected' : ''}`}
                        onClick={() => toggleEditTag(tag)}
                      >
                        <span className="tag-icon">
                          <LucideIcon name={tagIcon(tag, customTags)} size={13} />
                        </span>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="custom-activity-row">
                    <input
                      type="text"
                      placeholder="Adicionar atividade personalizada..."
                      value={editCustomActivity}
                      onChange={event => setEditCustomActivity(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addEditCustomActivity();
                        }
                      }}
                    />
                    <button className="btn btn-secondary btn-sm" onClick={addEditCustomActivity}>
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                <div className="form-full">
                  <label>
                    <span className="label-icon">
                      <FileText size={13} />
                    </span>
                    Observação
                  </label>
                  <textarea
                    value={editNote}
                    onChange={event => setEditNote(event.target.value)}
                    placeholder="Algo especial que queira lembrar..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </LayerPortal>
      )}
    </div>
  );
}
