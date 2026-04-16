/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Calendar,
  CalendarHeart,
  Check,
  Clock,
  Clock3,
  Eye,
  FileText,
  Heart,
  Image as ImageIcon,
  ImagePlus,
  ListChecks,
  Milestone,
  NotebookPen,
  Pencil,
  PenLine,
  Pin,
  Plus,
  Sparkles,
  Timer,
  Users,
  X,
} from 'lucide-react';
import LucideIcon from '@/components/common/LucideIcon';
import PhotoLightbox from '@/components/common/PhotoLightbox';
import { ICON_OPTIONS, tagIcon } from '@/lib/tagConfig';
import { formatDatePt, relativeTime, timeBetween } from '@/lib/dateUtils';

const DEMO_NOW = new Date('2026-04-11T12:00:00');

const REGISTER_TAGS = [
  'Assistir série',
  'Comer juntos',
  'Passear',
  'Jogar',
  'Chamego',
  'Cinema',
  'Treinar',
  'Peripécias',
  'Callzinha',
  'Dormir juntos',
];

const REGISTER_INITIAL = ['Chamego', 'Assistir série'];

const ALBUM_PHOTOS = [
  { id: 'album-1', src: 'https://picsum.photos/seed/nt-album-1/400/300', caption: 'Nosso pôr do sol', date: '2026-03-15', addedBy: 'Julianne' },
  { id: 'album-2', src: 'https://picsum.photos/seed/nt-album-2/400/300', caption: 'Jantar especial', date: '2026-03-22', addedBy: 'Julianne' },
  { id: 'album-3', src: 'https://picsum.photos/seed/nt-album-3/400/300', caption: 'Primeira selfie', date: '2026-03-26', addedBy: 'Ygor' },
  { id: 'album-4', src: 'https://picsum.photos/seed/nt-album-4/400/300', caption: 'Viagem à praia', date: '2026-04-02', addedBy: 'Ygor' },
  { id: 'album-5', src: 'https://picsum.photos/seed/nt-album-5/400/300', caption: 'Cozinhando juntos', date: '2026-04-05', addedBy: 'Julianne' },
  { id: 'album-6', src: 'https://picsum.photos/seed/nt-album-6/400/300', caption: 'Noite de cinema', date: '2026-04-08', addedBy: 'Ygor' },
];

const TIMELINE_ITEMS = [
  {
    id: 'timeline-4',
    date: '2024-01-10',
    title: 'Mudamos juntos',
    desc: 'Nosso cantinho. Finalmente montamos nosso lar. Cada canto tem um pedaço de nós dois.',
    addedBy: 'Julianne',
  },
  {
    id: 'timeline-3',
    date: '2023-07-15',
    title: 'Primeira viagem juntos',
    desc: '3 dias na praia. Ele queimou as costas e eu passei a viagem toda passando protetor nele.',
    addedBy: 'Julianne',
    photoSrc: ALBUM_PHOTOS[3].src,
  },
  {
    id: 'timeline-2',
    date: '2023-03-27',
    title: 'Oficialmente namorados',
    desc: 'Ele me perguntou se eu tinha provado que o amava. Eu disse que sim e aí ele ajoelhou na frente do sofá e me pediu em namoro. Aceitei antes dele terminar a frase.',
    addedBy: 'Julianne',
  },
  {
    id: 'timeline-1',
    date: '2023-03-26',
    title: 'Primeira vez que nos vimos',
    desc: 'Ele veio me ver e ficou 4 dias comigo. Eu achei ele ainda mais lindo do que eu imaginava. Foi um neném comigo.',
    addedBy: 'Julianne',
  },
];

const POSTITS_DATA = [
  { id: 'postit-1', tipo: 'recado', titulo: 'Te amo', conteudo: 'Só queria que você soubesse disso agora.', cor: 'rosa', rotacao: -4, createdByName: 'Julianne', destinatario: 'Ygor', criadoEm: '2026-04-13T10:00:00', visualizadoPor: ['uid-ygor'] },
  { id: 'postit-2', tipo: 'recado', titulo: 'Comprar vinho', conteudo: 'Aquele tinto que a gente tomou no aniversário. Lembra?', cor: 'amarelo', rotacao: 3, createdByName: 'Ygor', destinatario: 'Julianne', criadoEm: '2026-04-13T06:00:00', visualizadoPor: [] },
  { id: 'postit-3', tipo: 'recado', titulo: 'Saudade', conteudo: 'Tô contando as horas pra te ver de novo.', cor: 'lilas', rotacao: -5, createdByName: 'Julianne', destinatario: 'Ygor', criadoEm: '2026-04-12T12:00:00', visualizadoPor: [] },
  { id: 'postit-4', tipo: 'evento', titulo: 'Viagem em julho!', conteudo: 'Passagens compradas. Praia, nós dois, 5 dias.', cor: 'azul', rotacao: 4, createdByName: 'Ygor', dataEvento: '2026-07-15', horaEvento: '', criadoEm: '2026-04-10T09:00:00' },
  { id: 'postit-5', tipo: 'evento', titulo: 'Jantar com os pais', conteudo: 'Sábado às 20h na casa da minha mãe.', cor: 'verde', rotacao: -2, createdByName: 'Julianne', dataEvento: '2026-04-18', horaEvento: '20:00', criadoEm: '2026-04-11T14:00:00' },
  { id: 'postit-6', tipo: 'evento', titulo: 'Nosso aniversário', conteudo: '2 anos! Preciso pensar num presente.', cor: 'pessego', rotacao: 5, createdByName: 'Ygor', dataEvento: '2026-03-27', horaEvento: '', criadoEm: '2026-03-27T00:00:00' },
];

const DEMO_POSTIT_COLORS = [
  { id: 'amarelo', bg: '#fef9c3', border: '#fde047', ink: '#8a8475' },
  { id: 'rosa',    bg: '#fce7f3', border: '#f9a8d4', ink: '#8a7880' },
  { id: 'azul',    bg: '#dbeafe', border: '#93c5fd', ink: '#737d8a' },
  { id: 'verde',   bg: '#d1fae5', border: '#6ee7b7', ink: '#728a7e' },
  { id: 'lilas',   bg: '#ede9fe', border: '#c4b5fd', ink: '#7e788a' },
  { id: 'pessego', bg: '#ffedd5', border: '#fdba74', ink: '#8a7e72' },
];

function getDemoColor(id) {
  return DEMO_POSTIT_COLORS.find(c => c.id === id) || DEMO_POSTIT_COLORS[0];
}

const DEMO_DESKTOP_POSITIONS = [
  { x: 4,  y: 8  },
  { x: 36, y: 14 },
  { x: 66, y: 6  },
  { x: 10, y: 50 },
  { x: 43, y: 48 },
  { x: 72, y: 44 },
];

function formatDemoEventDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T12:00:00`);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d.getDate()} de ${months[d.getMonth()]}`;
}

function formatDemoEventDateLong(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T12:00:00`);
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${weekdays[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

const MURAL_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'recado', label: 'Recados' },
  { id: 'evento', label: 'Eventos' },
];

function formatShortDate(dateString) {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(`${dateString}T12:00:00`));
}

function formatLongDate(dateString) {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${dateString}T12:00:00`));
}

function ModalShell({ children, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="lpf-modal-overlay" role="dialog" aria-modal="true" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      {children}
    </div>,
    document.body
  );
}

function FeatureToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast || typeof document === 'undefined') return null;

  return createPortal(
    <div className="lpf-toast" role="status" aria-live="polite">
      <div className="lpf-toast-copy">
        <Heart size={16} className="lpf-toast-icon" />
        <span>{toast}</span>
      </div>
      <a href="/auth/register" className="lpf-toast-cta">Criar nosso espaço - é grátis</a>
      <button type="button" className="lpf-toast-close" onClick={onClose} aria-label="Fechar toast">
        <X size={14} />
      </button>
    </div>,
    document.body
  );
}

function DefaultBulletIcon() {
  return <Check size={15} strokeWidth={2.5} />;
}

function RegisterBulletIcon() {
  return (
    <span className="lpf-bullet-check">
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="11.5" />
        <path d="M9 14.3l3.2 3.2L19 10.8" />
      </svg>
    </span>
  );
}

function FeatureHeading({ before, accent, after = '', subtitle, bullets, align = 'left', BulletIcon = DefaultBulletIcon, className = '' }) {
  const normalizedSubtitle =
    typeof subtitle === 'string' ? subtitle.replace(/\s*\n+\s*/g, ' ').trim() : subtitle;

  return (
    <div className={`lpf-copy lpf-copy--${align} ${className}`.trim()}>
      <h2 className="lpf-title">
        {before}
        <span className="lp-cursive">{accent}</span>
        {after}
      </h2>
      {normalizedSubtitle ? <p className="lpf-subtitle">{normalizedSubtitle}</p> : null}
      {bullets?.length ? (
        <ul className="lpf-bullets">
          {bullets.map(item => (
            <li key={item}>
              <BulletIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function RegisterFeature({ onShowToast }) {
  const iconPickerRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState(REGISTER_INITIAL);
  const [hours, setHours] = useState('3');
  const [minutes, setMinutes] = useState('30');
  const [note, setNote] = useState('Noite de filme com pipoca caseira');
  const [customActivity, setCustomActivity] = useState('');
  const [customTags, setCustomTags] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState('sparkles');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const todayLabel = new Intl.DateTimeFormat('pt-BR').format(new Date());
  const tags = useMemo(() => [...REGISTER_TAGS, ...customTags.map(tag => tag.name)], [customTags]);

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
    setSelectedTags(current => (
      current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag]
    ));
  }

  function addCustomActivity() {
    const value = customActivity.trim();
    if (!value) return;
    if (tags.some(tag => tag.toLowerCase() === value.toLowerCase())) {
      setCustomActivity('');
      return;
    }

    setCustomTags(current => [...current, { name: value, icon: selectedIcon }]);
    setSelectedTags(current => (current.includes(value) ? current : [...current, value]));
    setCustomActivity('');
    setSelectedIcon('sparkles');
    setIconPickerOpen(false);
  }
  return (
    <section className="lpf-feature lpf-feature--soft lpf-feature--register-demo" id="funcionalidades">
      <div className="lpf-inner">
        <div className="lpf-row lpf-row--split lpf-row--balanced lpf-reveal">
          <div className="lpf-copy-wrap lpf-stagger">
            <div className="lpf-reveal-item" style={{ '--lpf-delay': '0ms' }}>
              <div className="lpf-copy lpf-register-copy">
                <h2 className="lpf-title">
                  Registrem cada <span className="lp-cursive">momento</span>
                </h2>
                <p className="lpf-subtitle">Do chamego no sofá até a peripécia de madrugada.</p>
                <div className="lpf-register-cards">
                  <div className="lpf-register-card">
                    <ListChecks size={24} className="lpf-register-card-icon lpf-register-card-icon--1" />
                    <div>
                      <p className="lpf-register-card-title">Atividades com um toque</p>
                      <p className="lpf-register-card-desc">Escolham o que fizeram juntos de forma simples e intuitiva.</p>
                    </div>
                  </div>
                  <div className="lpf-register-card">
                    <Clock size={24} className="lpf-register-card-icon lpf-register-card-icon--2" />
                    <div>
                      <p className="lpf-register-card-title">Tempo registrado</p>
                      <p className="lpf-register-card-desc">Anotem quantas horas e minutos ficaram juntos.</p>
                    </div>
                  </div>
                  <div className="lpf-register-card">
                    <PenLine size={24} className="lpf-register-card-icon lpf-register-card-icon--3" />
                    <div>
                      <p className="lpf-register-card-title">Detalhes que importam</p>
                      <p className="lpf-register-card-desc">Observações para nunca esquecer o contexto.</p>
                    </div>
                  </div>
                  <div className="lpf-register-card">
                    <Users size={24} className="lpf-register-card-icon lpf-register-card-icon--4" />
                    <div>
                      <p className="lpf-register-card-title">Registro identificado</p>
                      <p className="lpf-register-card-desc">Cada momento mostra quem do casal adicionou.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lpf-surface-wrap lpf-surface-wrap--bleed lpf-stagger">
            <div className="lpf-reveal-item" style={{ '--lpf-delay': '120ms' }}>
              <div className="lpf-surface lpf-surface--register">
                <div className="lpf-register-head page-header">
                  <h1>Registrar Momento</h1>
                  <p>
                    <Pencil size={14} color="var(--rosa-400)" />
                    Adicione as horas que vocês passaram juntos
                  </p>
                </div>

                <div className="form-grid lpf-register-form">
                  <div className="lpf-field">
                    <label>
                      <span className="label-icon">
                        <Calendar size={13} />
                      </span>
                      Data
                    </label>
                    <input type="text" value={todayLabel} readOnly />
                  </div>

                  <div className="lpf-field">
                    <label>
                      <span className="label-icon">
                        <Clock3 size={13} />
                      </span>
                      Tempo juntos
                    </label>
                    <div className="time-input-row">
                      <input type="number" min="0" max="23" placeholder="Horas" value={hours} onChange={event => setHours(event.target.value)} />
                      <span className="time-sep">h</span>
                      <input type="number" min="0" max="59" placeholder="Min" value={minutes} onChange={event => setMinutes(event.target.value)} />
                      <span className="time-sep">min</span>
                    </div>
                  </div>

                  <div className="lpf-field lpf-field--full">
                    <label>
                      <span className="label-icon">
                        <Sparkles size={13} />
                      </span>
                      O que vocês fizeram?
                    </label>
                    <div className="preset-tags">
                      {tags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          className={`tag${selectedTags.includes(tag) ? ' selected' : ''}`}
                          onClick={() => toggleTag(tag)}
                          aria-pressed={selectedTags.includes(tag)}
                        >
                          <span className="tag-icon" aria-hidden="true">
                            <LucideIcon name={tagIcon(tag, customTags)} size={13} />
                          </span>
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>

                    <div className="icon-picker-area lpf-icon-picker-area" ref={iconPickerRef}>
                      <div className="tag-input-row">
                        <button className={`icon-picker-btn${iconPickerOpen ? ' active' : ''}`} type="button" onClick={() => setIconPickerOpen(open => !open)} aria-label="Escolher ícone para atividade" aria-expanded={iconPickerOpen} aria-haspopup="true">
                          <LucideIcon name={selectedIcon} size={16} aria-hidden="true" />
                        </button>
                        <input
                          type="text"
                          placeholder="Nova atividade..."
                          aria-label="Nome da nova atividade"
                          value={customActivity}
                          onChange={event => setCustomActivity(event.target.value)}
                          onKeyDown={event => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              addCustomActivity();
                            }
                          }}
                        />
                        <button type="button" className="btn btn-secondary btn-sm tag-add-btn" onClick={addCustomActivity}>
                          <Plus size={14} />
                          Adicionar
                        </button>
                      </div>

                      {iconPickerOpen ? (
                        <div className="icon-picker-popup show">
                          <div className="icon-picker-title">Escolha um ícone</div>
                          <div className="icon-grid">
                            {ICON_OPTIONS.map(icon => (
                              <button
                                key={icon}
                                type="button"
                                aria-label={icon}
                                aria-pressed={selectedIcon === icon}
                                className={`icon-option${selectedIcon === icon ? ' selected' : ''}`}
                                onClick={() => {
                                  setSelectedIcon(icon);
                                  setIconPickerOpen(false);
                                }}
                              >
                                <LucideIcon name={icon} size={18} aria-hidden="true" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="lpf-field lpf-field--full">
                    <label>
                      <span className="label-icon">
                        <FileText size={13} />
                      </span>
                      Observação <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span>
                    </label>
                    <textarea rows={4} value={note} onChange={event => setNote(event.target.value)} placeholder="Algo especial que queira lembrar..." />
                  </div>
                </div>

                <div className="form-actions register-actions lpf-register-actions">
                  <button type="button" className="btn btn-primary lpf-register-save-btn" onClick={() => onShowToast('Crie seu espaço para registrar os momentos do casal')}>
                    <Heart size={15} />
                    Salvar Momento
                  </button>
                  <button type="button" className="btn btn-secondary lpf-register-history-btn" onClick={() => onShowToast('Crie seu espaço para ver o histórico do casal')}>
                    <BookOpen size={15} />
                    Ver Histórico
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AlbumFeature({ onShowToast }) {
  const [filter, setFilter] = useState('todas');
  const [lightboxItem, setLightboxItem] = useState(null);

  const filteredPhotos = useMemo(() => {
    if (filter === 'todas') return ALBUM_PHOTOS;
    if (filter === 'mes') {
      return ALBUM_PHOTOS.filter(photo => {
        const date = new Date(`${photo.date}T12:00:00`);
        return date.getMonth() === DEMO_NOW.getMonth() && date.getFullYear() === DEMO_NOW.getFullYear();
      });
    }

    return ALBUM_PHOTOS.filter(photo => {
      const date = new Date(`${photo.date}T12:00:00`);
      return date.getFullYear() === DEMO_NOW.getFullYear();
    });
  }, [filter]);
  const memoriesLabel = filteredPhotos.length === 1 ? '1 memória guardada' : `${filteredPhotos.length} memórias guardadas`;

  return (
    <>
      {lightboxItem ? <PhotoLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} /> : null}

      <section className="lpf-feature lpf-feature--soft">
        <div className="lpf-inner">
          <div className="lpf-stack lpf-reveal">
            <div className="lpf-center-head lpf-stagger">
              <div className="lpf-reveal-item" style={{ '--lpf-delay': '0ms' }}>
                <div className="lpf-copy lpf-album-copy">
                  <h2 className="lpf-title">
                    Um álbum só de vocês <span className="lp-cursive">dois</span>
                  </h2>
                  <p className="lpf-subtitle">As fotos que importam ficam organizadas, seguras e num lugar só do casal.</p>
                </div>
              </div>
            </div>

            <div className="lpf-stagger">
              <div className="lpf-reveal-item" style={{ '--lpf-delay': '120ms' }}>
                <div className="lpf-surface lpf-surface--album lpf-surface--showcase">
                  <div className="lpf-album-head page-header">
                    <h1>Nosso Álbum</h1>
                    <p>
                      <ImageIcon size={14} color="var(--rosa-400)" /> As memórias mais especiais de vocês dois
                    </p>
                  </div>

                  <div className="lpf-surface-topbar lpf-surface-topbar--album album-controls">
                    <button type="button" className="lpf-secondary-btn" onClick={() => onShowToast('Crie seu espaço para guardar as fotos de vocês')}>
                      <ImagePlus size={15} />
                      Adicionar Foto
                    </button>

                    <div className="lpf-filter-group">
                      {[
                        { id: 'todas', label: 'Todas' },
                        { id: 'mes', label: 'Este Mês' },
                        { id: 'ano', label: 'Este Ano' },
                      ].map(item => (
                        <button key={item.id} type="button" aria-pressed={filter === item.id} className={`lpf-filter-pill${filter === item.id ? ' is-active' : ''}`} onClick={() => setFilter(item.id)}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="lpf-album-count">{memoriesLabel}</div>

                  <div className="lpf-album-grid">
                    {filteredPhotos.map(photo => (
                      <button
                        key={photo.id}
                        type="button"
                        aria-label={`Ver foto: ${photo.caption}`}
                        className="lpf-album-card"
                        onClick={() =>
                          setLightboxItem({
                            src: photo.src,
                            caption: photo.caption,
                            dateLabel: formatLongDate(photo.date),
                          })
                        }
                      >
                        <img src={photo.src} alt={photo.caption} className="lpf-album-image" loading="lazy" decoding="async" width={400} height={300} />
                        <div className="lpf-album-body">
                          <strong>{photo.caption}</strong>
                          <span>{formatShortDate(photo.date)}</span>
                          <small>Adicionado por {photo.addedBy}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function TimelineFeature({ onShowToast }) {
  const [lightboxItem, setLightboxItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const countLabel =
    TIMELINE_ITEMS.length === 1 ? '1 marco na história de vocês' : `${TIMELINE_ITEMS.length} marcos na história de vocês`;
  const desktopTimelineItems = useMemo(() => [...TIMELINE_ITEMS].reverse(), []);
  const desktopRelativeLabels = useMemo(
    () => ({
      'timeline-1': 'há 3 anos',
      'timeline-2': 'há 3 anos',
      'timeline-3': 'há 2 anos e 8 meses',
      'timeline-4': 'há 2 anos e 3 meses',
    }),
    []
  );
  const desktopGapLabels = useMemo(
    () => ({
      'timeline-1': '1 dia depois',
      'timeline-2': '4 meses depois',
      'timeline-3': '6 meses depois',
    }),
    []
  );

  return (
    <>
      {lightboxItem ? <PhotoLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} /> : null}

      <section className="lpf-feature lpf-feature--soft lpf-feature--timeline">
        <div className="lpf-inner">
          <div className="lpf-timeline-desktop lpf-reveal">
            <div className="lpf-timeline-desktop-copy lpf-stagger">
              <div className="lpf-reveal-item" style={{ '--lpf-delay': '0ms' }}>
                <FeatureHeading
                  before="Vejam a "
                  accent="história"
                  after=" crescer"
                  subtitle="Cada marco do casal numa timeline que vocês vão amar revisitar."
                />
              </div>
            </div>

            <div className="lpf-reveal-item" style={{ '--lpf-delay': '80ms' }}>
              <div className="lpf-surface lpf-surface--timeline-desktop">
                <div className="page-header lpf-timeline-head">
                  <div className="lpf-timeline-head-row">
                    <div>
                      <h1>Nossa Linha do Tempo</h1>
                      <p>
                        <Milestone size={14} color="var(--rosa-400)" /> Clique nos cards para reviver cada capítulo dessa história
                      </p>
                    </div>
                    <div className="milestone-count lpf-timeline-count">{countLabel}</div>
                  </div>
                </div>

                <div className="lpf-timeline-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => onShowToast('Crie seu espaço para construir a linha do tempo do casal')}>
                    <Plus size={14} strokeWidth={2.5} />
                    Adicionar Marco
                  </button>
                </div>

                <div className="lpf-timeline-horizontal">
                  <div className="lpf-timeline-horizontal-line"></div>

                  <div className="lpf-timeline-horizontal-track">
                    {desktopTimelineItems.map((item, index) => {
                      const isTop = index % 2 === 0;
                      const betweenLabel = desktopGapLabels[item.id] ?? null;
                      const isActive = expandedId === item.id;
                      const isActivePhotoCard = isActive && Boolean(item.photoSrc);
                      const expandSideClass = 'lpf-ht-card-wrap--expand-right';

                      return (
                        <div
                          key={item.id}
                          className={`lpf-ht-node${isTop ? ' is-top' : ' is-bottom'} lpf-reveal-item`}
                          style={{ '--lpf-delay': `${140 + index * 90}ms` }}
                        >
                          <div className={`lpf-ht-card-wrap ${expandSideClass}${isActivePhotoCard ? ' is-active-photo' : ''}`}>
                            <div
                              className={`lpf-ht-card${isActive ? ' is-active' : ''}${item.photoSrc ? ' has-photo' : ''}`}
                              role="button"
                              tabIndex={0}
                              aria-expanded={isActive}
                              aria-label={item.title}
                              onClick={() => setExpandedId(isActive ? null : item.id)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setExpandedId(isActive ? null : item.id);
                                }
                              }}
                            >
                              <div className="lpf-ht-main">
                                <div className="lpf-ht-copy">
                                  <span className="lpf-ht-date">{formatDatePt(item.date).toUpperCase()}</span>
                                  <strong>{item.title}</strong>
                                  {isActive && item.desc ? (
                                    <p className="lpf-ht-desc lpf-ht-desc--delayed">"{item.desc}"</p>
                                  ) : null}
                                  <span className="lpf-ht-meta">
                                    <Clock size={13} />
                                    {desktopRelativeLabels[item.id] ?? relativeTime(item.date)}
                                  </span>
                                  <small>Adicionado por {item.addedBy}</small>
                                </div>

                                {item.photoSrc ? (
                                  <div className={`lpf-ht-media-slot${isActive ? ' is-active' : ''}`}>
                                    {isActive ? (
                                      <img
                                        className="lpf-ht-photo lpf-ht-photo--delayed"
                                        src={item.photoSrc}
                                        alt={item.title}
                                        loading="lazy"
                                        decoding="async"
                                        onClick={e => {
                                          e.stopPropagation();
                                          setLightboxItem({ src: item.photoSrc, title: item.title, dateLabel: formatDatePt(item.date) });
                                        }}
                                      />
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <span className="lpf-ht-connector"></span>
                          </div>

                          <span className={`lpf-ht-dot${isActive ? ' is-active' : ''}`} aria-hidden="true" />

                          {betweenLabel ? (
                            <div className="lpf-ht-gap">
                              <span>{betweenLabel}</span>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="lpf-reveal-item" style={{ '--lpf-delay': '120ms' }}>
              <div className="lpf-timeline-feature-grid">
                <div className="lpf-timeline-feature-cell">
                  <CalendarHeart size={24} className="lpf-timeline-feature-icon lpf-timeline-feature-icon--1" />
                  <p className="lpf-timeline-feature-title">Datas que marcaram</p>
                  <p className="lpf-timeline-feature-desc">Organizem os marcos mais importantes por data.</p>
                </div>

                <div className="lpf-timeline-feature-cell">
                  <ImageIcon size={24} className="lpf-timeline-feature-icon lpf-timeline-feature-icon--2" />
                  <p className="lpf-timeline-feature-title">Fotos nos marcos</p>
                  <p className="lpf-timeline-feature-desc">Adicionem fotos opcionais pra reviver cada momento.</p>
                </div>

                <div className="lpf-timeline-feature-cell">
                  <Timer size={24} className="lpf-timeline-feature-icon lpf-timeline-feature-icon--3" />
                  <p className="lpf-timeline-feature-title">Tempo entre marcos</p>
                  <p className="lpf-timeline-feature-desc">Vejam quanto tempo passou entre cada capítulo.</p>
                </div>

                <div className="lpf-timeline-feature-cell">
                  <PenLine size={24} className="lpf-timeline-feature-icon lpf-timeline-feature-icon--4" />
                  <p className="lpf-timeline-feature-title">Contem com detalhes</p>
                  <p className="lpf-timeline-feature-desc">Escrevam o que sentiram - é isso que dá alma à timeline.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lpf-timeline-mobile">
            <div className="lpf-row lpf-row--split lpf-row--balanced lpf-reveal">
              <div className="lpf-copy-wrap lpf-stagger">
                <div className="lpf-reveal-item" style={{ '--lpf-delay': '0ms' }}>
                  <FeatureHeading
                    before="Vejam a "
                    accent="história"
                    after=" crescer"
                    subtitle="Cada marco do casal numa timeline que vocês vão amar revisitar."
                  />
                </div>

                <div className="lpf-reveal-item" style={{ '--lpf-delay': '70ms' }}>
                  <div className="lpf-timeline-cards">
                    <div className="lpf-timeline-card-copy">
                      <CalendarHeart size={24} className="lpf-timeline-card-icon lpf-timeline-card-icon--1" />
                      <div>
                        <p className="lpf-timeline-card-title">Datas que marcaram</p>
                        <p className="lpf-timeline-card-desc">Organizem os marcos mais importantes por data.</p>
                      </div>
                    </div>

                    <div className="lpf-timeline-card-copy">
                      <ImageIcon size={24} className="lpf-timeline-card-icon lpf-timeline-card-icon--2" />
                      <div>
                        <p className="lpf-timeline-card-title">Fotos nos marcos</p>
                        <p className="lpf-timeline-card-desc">Adicionem fotos opcionais pra reviver cada momento.</p>
                      </div>
                    </div>

                    <div className="lpf-timeline-card-copy">
                      <Timer size={24} className="lpf-timeline-card-icon lpf-timeline-card-icon--3" />
                      <div>
                        <p className="lpf-timeline-card-title">Tempo entre marcos</p>
                        <p className="lpf-timeline-card-desc">Vejam quanto tempo passou entre cada capítulo.</p>
                      </div>
                    </div>

                    <div className="lpf-timeline-card-copy">
                      <PenLine size={24} className="lpf-timeline-card-icon lpf-timeline-card-icon--4" />
                      <div>
                        <p className="lpf-timeline-card-title">Contem com detalhes</p>
                        <p className="lpf-timeline-card-desc">Escrevam o que sentiram - é isso que dá alma à timeline.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lpf-surface-wrap lpf-stagger">
                <div className="lpf-reveal-item" style={{ '--lpf-delay': '120ms' }}>
                  <div className="lpf-surface lpf-surface--timeline">
                    <div className="page-header lpf-timeline-head">
                      <h1>Nossa Linha do Tempo</h1>
                      <p>
                        <Milestone size={14} color="var(--rosa-400)" /> Veja os cards para reviver cada capítulo dessa história
                      </p>
                    </div>

                    <div className="lpf-timeline-actions">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => onShowToast('Crie seu espaço para construir a linha do tempo do casal')}>
                        <Plus size={14} strokeWidth={2.5} />
                        Adicionar Marco
                      </button>
                    </div>

                    <div className="milestone-count lpf-timeline-count">{countLabel}</div>

                    <div className="lpf-timeline-demo-shell">
                      <div className="tl-wrap">
                        <div className="tl-vline"></div>

                        {TIMELINE_ITEMS.map((item, index) => {
                          const side = index % 2 === 0 ? 'tl-left' : 'tl-right';
                          const isNewest = index === 0;
                          const isOldest = index === TIMELINE_ITEMS.length - 1;
                          const dotClass = isNewest ? 'tl-dot tl-dot-pulse' : isOldest ? 'tl-dot tl-dot-first' : 'tl-dot';
                          const betweenLabel = index < TIMELINE_ITEMS.length - 1 ? timeBetween(TIMELINE_ITEMS[index + 1].date, item.date) : null;

                          return (
                            <div key={item.id}>
                              <div className={`tl-item ${side}`}>
                                <div className="tl-center">
                                  <div className={dotClass}></div>
                                </div>

                                <div className="tl-card-wrap">
                                  <div
                                    className="milestone-card lpf-demo-milestone"
                                  >
                                    <div className="ms-date">{formatDatePt(item.date)}</div>
                                    <div className="ms-title">{item.title}</div>
                                    <div className="ms-desc">"{item.desc}"</div>

                                    {item.photoSrc ? (
                                      <img
                                        className="ms-photo"
                                        src={item.photoSrc}
                                        alt={item.title}
                                        loading="lazy"
                                        decoding="async"
                                        width={400}
                                        height={300}
                                        onClick={event => {
                                          event.stopPropagation();
                                          setLightboxItem({
                                            src: item.photoSrc,
                                            title: item.title,
                                            dateLabel: formatDatePt(item.date),
                                          });
                                        }}
                                      />
                                    ) : null}

                                    <div className="ms-relative-time">{desktopRelativeLabels[item.id] ?? relativeTime(item.date)}</div>
                                    <div className="ms-byline">Adicionado por {item.addedBy}</div>
                                  </div>
                                </div>
                              </div>

                              {betweenLabel ? (
                                <div className="tl-between">
                                  <span>{betweenLabel}</span>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MuralInlineForm({ tipo, onClose, onSubmit }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [horaEvento, setHoraEvento] = useState('');
  const isEvento = tipo === 'evento';
  const isValid = titulo.trim() && (!isEvento || dataEvento);
  const colorObj = getDemoColor(isEvento ? 'azul' : 'amarelo');

  return (
    <div className="card mural-inline-form" style={{ borderTop: `3px solid ${colorObj.border}`, marginBottom: 28 }}>
      <div className="card-title">
        {isEvento ? <Calendar size={14} /> : <NotebookPen size={14} />}
        Registrar {isEvento ? 'Evento' : 'Recado'}
      </div>

      <div className="form-grid">
        <div className="form-full">
          <label>{isEvento ? 'Nome do evento' : 'Título do recado'}</label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder={isEvento ? 'Nome do evento...' : 'Um título pro recado...'}
            autoFocus
          />
        </div>

        <div className="form-full">
          <label>
            {isEvento ? 'Detalhes' : 'Conteúdo'}
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>(opcional)</span>
          </label>
          <textarea
            value={conteudo}
            onChange={e => setConteudo(e.target.value)}
            placeholder={isEvento ? 'Detalhes, planos, o que quiserem anotar...' : 'Escreva aqui o que quiser dizer...'}
            rows={3}
          />
        </div>

        {isEvento && (
          <div>
            <label>
              <span className="label-icon"><Calendar size={13} /></span>
              Data do evento
            </label>
            <input
              type="date"
              value={dataEvento}
              onChange={e => setDataEvento(e.target.value)}
            />
          </div>
        )}

        {isEvento && (
          <div>
            <label>
              <span className="label-icon"><Clock size={13} /></span>
              Horário
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>(opcional)</span>
            </label>
            <input
              type="time"
              value={horaEvento}
              onChange={e => setHoraEvento(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={onSubmit} disabled={!isValid}>
          <Pin size={14} strokeWidth={2.5} />
          Pregar no mural
        </button>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function MuralDetailModal({ item, onClose }) {
  const colorObj = getDemoColor(item.cor);
  const isEvento = item.tipo === 'evento';
  const isViewed = !isEvento && Array.isArray(item.visualizadoPor) && item.visualizadoPor.length > 0;

  const eventDateLabel = isEvento && item.dataEvento ? formatDemoEventDateLong(item.dataEvento) : '';
  const eventTimeLabel = isEvento && item.horaEvento ? item.horaEvento.replace(':', 'h') : '';

  return (
    <ModalShell onClose={onClose}>
      <div
        className="modal mural-detail-modal"
        style={{ '--postit-accent': colorObj.border, '--postit-accent-bg': colorObj.bg, background: colorObj.bg }}
      >
        <div className="mural-detail-accent-bar" />

        <div className="mural-detail-header">
          <div className="mural-detail-header-left">
            <span className="mural-detail-icon-badge" style={{ background: '#fff' }}>
              {isEvento
                ? <Calendar size={15} color={colorObj.ink} />
                : <Heart size={15} color={colorObj.border} fill={colorObj.border} />
              }
            </span>
            <span className="mural-detail-type" style={{ color: colorObj.ink }}>
              {isEvento ? 'Evento' : 'Recado'}
            </span>
          </div>
          <button className="modal-close" onClick={onClose} style={{ color: colorObj.ink }}>
            <X size={16} />
          </button>
        </div>

        <div className={`mural-detail-body${!isEvento && !item.conteudo ? ' mural-detail-body--centered' : ''}`}>
          <div className={`mural-detail-titulo${!isEvento && !item.conteudo ? ' mural-detail-titulo--centered' : ''}`}>
            {item.titulo}
          </div>

          {item.conteudo ? (
            <div className="mural-detail-conteudo">{item.conteudo}</div>
          ) : null}

          {isEvento && (eventDateLabel || eventTimeLabel) && (
            <div className="mural-detail-info-block">
              {eventDateLabel && (
                <div className="mural-detail-info-row">
                  <span className="mural-detail-info-icon" style={{ background: '#fff' }}>
                    <Calendar size={13} color="var(--text-muted)" />
                  </span>
                  <span>{eventDateLabel}</span>
                </div>
              )}
              {eventTimeLabel && (
                <div className="mural-detail-info-row">
                  <span className="mural-detail-info-icon" style={{ background: '#fff' }}>
                    <Clock size={13} color="var(--text-muted)" />
                  </span>
                  <span>{eventTimeLabel}</span>
                </div>
              )}
            </div>
          )}

          {!isEvento && (
            <div className="mural-recado-route">
              <span className="mural-recado-route-name">{item.createdByName || '—'}</span>
              <span className="mural-recado-route-arrow">
                <Heart size={13} color={colorObj.border} fill={colorObj.border} />
              </span>
              <span className="mural-recado-route-name">{item.destinatario || '—'}</span>
            </div>
          )}
        </div>

        <div className="mural-detail-footer">
          {!isEvento && (
            <div className="mural-detail-meta">
              <Clock size={12} />
              <span>{isViewed ? 'Visto' : 'Não visto ainda'}</span>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function MuralFeature({ onShowToast }) {
  const [filter, setFilter] = useState('todos');
  const [detailItem, setDetailItem] = useState(null);
  const [dragPositions, setDragPositions] = useState(() => {
    const positions = {};
    POSTITS_DATA.forEach((item, idx) => {
      positions[item.id] = DEMO_DESKTOP_POSITIONS[idx] || { x: (idx * 12) % 80, y: (idx * 18) % 70 };
    });
    return positions;
  });
  const [draggingId, setDraggingId] = useState(null);
  const boardRef = useRef(null);
  const dragStateRef = useRef(null);
  const suppressClickRef = useRef(null);

  const filtered = useMemo(
    () => filter === 'todos' ? POSTITS_DATA : POSTITS_DATA.filter(i => i.tipo === filter),
    [filter]
  );

  const recadosCount = POSTITS_DATA.filter(i => i.tipo === 'recado').length;
  const eventosCount = POSTITS_DATA.filter(i => i.tipo === 'evento').length;

  const handleDragMove = useCallback((event) => {
    const drag = dragStateRef.current;
    const boardEl = boardRef.current;
    if (!drag || !boardEl) return;

    const boardRect = boardEl.getBoundingClientRect();
    const maxLeft = Math.max(0, boardRect.width - drag.cardWidth);
    const maxTop = Math.max(0, boardRect.height - drag.cardHeight);

    const nextLeftPx = Math.max(0, Math.min(maxLeft, event.clientX - boardRect.left - drag.pointerOffsetX));
    const nextTopPx = Math.max(0, Math.min(maxTop, event.clientY - boardRect.top - drag.pointerOffsetY));

    const nextPosition = {
      x: Number(((nextLeftPx / boardRect.width) * 100).toFixed(2)),
      y: Number(((nextTopPx / boardRect.height) * 100).toFixed(2)),
    };

    if (
      !drag.hasMoved &&
      (Math.abs(event.clientX - drag.startClientX) > 4 || Math.abs(event.clientY - drag.startClientY) > 4)
    ) {
      drag.hasMoved = true;
      suppressClickRef.current = drag.itemId;
    }

    drag.latestPosition = nextPosition;

    setDragPositions(current => {
      const previous = current[drag.itemId];
      if (previous && previous.x === nextPosition.x && previous.y === nextPosition.y) return current;
      return { ...current, [drag.itemId]: nextPosition };
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    dragStateRef.current = null;
    setDraggingId(null);
  }, []);

  useEffect(() => {
    if (!draggingId) return undefined;
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [draggingId, handleDragEnd, handleDragMove]);

  function handleDesktopDragStart(item, event) {
    if (window.innerWidth <= 768 || event.button !== 0) return;
    const boardEl = boardRef.current;
    if (!boardEl) return;
    event.preventDefault();

    const cardRect = event.currentTarget.getBoundingClientRect();
    const currentPosition = dragPositions[item.id] || DEMO_DESKTOP_POSITIONS[0];

    dragStateRef.current = {
      itemId: item.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      pointerOffsetX: event.clientX - cardRect.left,
      pointerOffsetY: event.clientY - cardRect.top,
      cardWidth: cardRect.width,
      cardHeight: cardRect.height,
      latestPosition: currentPosition,
      hasMoved: false,
    };

    setDraggingId(item.id);
  }

  function handlePostItClick(item) {
    if (suppressClickRef.current === item.id) {
      suppressClickRef.current = null;
      return;
    }
    setDetailItem(item);
  }

  return (
    <>
      {detailItem && (
        <MuralDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}

      <section className="lpf-feature lpf-feature--soft lpf-feature--mural">
        <div className="lpf-inner">
          <div className="lpf-stack lpf-reveal">
            <div className="lpf-center-head lpf-stagger">
              <div className="lpf-reveal-item" style={{ '--lpf-delay': '0ms' }}>
                <FeatureHeading
                  before="O mural de vocês "
                  accent="dois"
                  subtitle={'Deixem bilhetinhos, anotem planos e preguem tudo no mural do casal.\nCada post-it é um pedacinho de vocês.'}
                  align="center"
                />
              </div>
            </div>

            <div className="lpf-stagger">
              <div className="lpf-reveal-item" style={{ '--lpf-delay': '120ms' }}>
                <div className="lpf-surface lpf-surface--mural-demo">

                  {/* Header */}
                  <div className="page-header">
                    <h1>Nosso Mural</h1>
                    <p>
                      <Pin size={14} color="var(--rosa-400)" />
                      Recados, planos e tudo que o casal quer lembrar
                    </p>
                  </div>

                  {/* Controles */}
                  <div className="mural-controls">
                      <div className="mural-action-row">
                        <button className="btn btn-primary btn-sm" onClick={() => onShowToast('Crie seu espaço para deixar recados pro seu amor')}>
                          <NotebookPen size={14} strokeWidth={2.5} />
                          Registrar Recado
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => onShowToast('Crie seu espaço para deixar recados pro seu amor')}>
                          <Calendar size={14} />
                          Registrar Evento
                        </button>
                      </div>

                      <div className="filter-chips">
                        {MURAL_FILTERS.map(f => (
                          <button
                            key={f.id}
                            className={`filter-chip${filter === f.id ? ' active' : ''}`}
                            onClick={() => setFilter(f.id)}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                  </div>

                  {/* Contador */}
                  <div className="card-title mural-counter">
                    {recadosCount > 0 && `${recadosCount} ${recadosCount === 1 ? 'recado' : 'recados'}`}
                    {recadosCount > 0 && eventosCount > 0 && ' · '}
                    {eventosCount > 0 && `${eventosCount} ${eventosCount === 1 ? 'evento' : 'eventos'}`}
                  </div>

                  {/* Desktop: mural livre com drag */}
                  <div className={`mural-board lpf-mural-board-demo${draggingId ? ' is-dragging' : ''}`} ref={boardRef}>
                    {filtered.map((item, idx) => {
                      const colorObj = getDemoColor(item.cor);
                      const pos = dragPositions[item.id] || { x: (idx * 12) % 80, y: (idx * 18) % 70 };
                      const isEvento = item.tipo === 'evento';
                      const isViewed = !isEvento && Array.isArray(item.visualizadoPor) && item.visualizadoPor.length > 0;
                      const eventMeta = item.dataEvento
                        ? `${formatDemoEventDateShort(item.dataEvento)}${item.horaEvento ? ` · ${item.horaEvento}` : ''}`
                        : '';

                      return (
                        <div
                          key={item.id}
                          className={`postit ${isEvento ? 'postit--evento' : 'postit--recado'}${draggingId === item.id ? ' is-dragging' : ''}${isViewed ? ' postit--viewed' : ''}`}
                          style={{
                            '--postit-bg': colorObj.bg,
                            '--postit-border': colorObj.border,
                            transform: `rotate(${item.rotacao || 0}deg)`,
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            zIndex: draggingId === item.id ? filtered.length + 100 : filtered.length - idx,
                          }}
                          onClick={() => handlePostItClick(item)}
                          onMouseDown={event => handleDesktopDragStart(item, event)}
                        >
                          <div className="postit-pin">
                            <span className="postit-pin-head" />
                            <span className="postit-pin-cap" />
                            <span className="postit-pin-needle" />
                          </div>

                          <div className="postit-type-badge">
                            {isEvento ? <Calendar size={11} /> : <Heart size={11} />}
                          </div>

                          {isViewed ? (
                            <div className="postit-viewed-badge">
                              <Eye size={10} />
                              <span>Visto</span>
                            </div>
                          ) : null}

                          <div className="postit-titulo">{item.titulo}</div>

                          {item.conteudo ? (
                            <div className="postit-conteudo">{item.conteudo}</div>
                          ) : null}

                          {eventMeta ? (
                            <div className="postit-event-meta">{eventMeta}</div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile: grid 2 colunas */}
                  <div className="mural-grid lpf-mural-grid-demo">
                    {filtered.map(item => {
                      const colorObj = getDemoColor(item.cor);
                      const isEvento = item.tipo === 'evento';
                      const isViewed = !isEvento && Array.isArray(item.visualizadoPor) && item.visualizadoPor.length > 0;
                      const eventMeta = item.dataEvento
                        ? `${formatDemoEventDateShort(item.dataEvento)}${item.horaEvento ? ` · ${item.horaEvento}` : ''}`
                        : '';

                      return (
                        <div
                          key={item.id}
                          className={`postit ${isEvento ? 'postit--evento' : 'postit--recado'}${isViewed ? ' postit--viewed' : ''}`}
                          style={{
                            '--postit-bg': colorObj.bg,
                            '--postit-border': colorObj.border,
                            transform: `rotate(${item.rotacao || 0}deg)`,
                          }}
                          onClick={() => handlePostItClick(item)}
                        >
                          <div className="postit-pin">
                            <span className="postit-pin-head" />
                            <span className="postit-pin-cap" />
                            <span className="postit-pin-needle" />
                          </div>

                          <div className="postit-type-badge">
                            {isEvento ? <Calendar size={11} /> : <Heart size={11} />}
                          </div>

                          {isViewed ? (
                            <div className="postit-viewed-badge">
                              <Eye size={10} />
                              <span>Visto</span>
                            </div>
                          ) : null}

                          <div className="postit-titulo">{item.titulo}</div>

                          {item.conteudo ? (
                            <div className="postit-conteudo">{item.conteudo}</div>
                          ) : null}

                          {eventMeta ? (
                            <div className="postit-event-meta">{eventMeta}</div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function FeaturesSection() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(message => {
    setToast(message);
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll('.lpf-reveal, .lpf-reveal-item');
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    );

    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <FeatureToast toast={toast} onClose={closeToast} />
      <RegisterFeature onShowToast={showToast} />
      <AlbumFeature onShowToast={showToast} />
      <TimelineFeature onShowToast={showToast} />
      <MuralFeature onShowToast={showToast} />
    </>
  );
}
