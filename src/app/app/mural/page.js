'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  NotebookPen,
  MapPin,
  Pencil,
  Pin,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCouple } from '@/contexts/CoupleContext';
import { useCoupleMural } from '@/contexts/CoupleContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import AppDatePicker from '@/components/common/AppDatePicker';
import AppTimePicker from '@/components/common/AppTimePicker';
import LayerPortal from '@/components/common/LayerPortal';
import { MONTHS_PT } from '@/lib/dateUtils';

// ─── Paleta de cores dos post-its ────────────────────────────────────────────

const POSTIT_COLORS = [
  { id: 'amarelo', bg: '#fef9c3', border: '#fde047', ink: '#8a8475' },
  { id: 'rosa',    bg: '#fce7f3', border: '#f9a8d4', ink: '#8a7880' },
  { id: 'azul',    bg: '#dbeafe', border: '#93c5fd', ink: '#737d8a' },
  { id: 'verde',   bg: '#d1fae5', border: '#6ee7b7', ink: '#728a7e' },
  { id: 'lilas',   bg: '#ede9fe', border: '#c4b5fd', ink: '#7e788a' },
  { id: 'pessego', bg: '#ffedd5', border: '#fdba74', ink: '#8a7e72' },
];

const DEFAULT_COLOR_RECADO = 'amarelo';
const DEFAULT_COLOR_EVENTO = 'azul';

function getColor(id) {
  return POSTIT_COLORS.find(c => c.id === id) || POSTIT_COLORS[0];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomRotation() {
  return Math.round(randomBetween(-6, 6) * 10) / 10;
}

function randomPos() {
  return {
    posicaoX: Math.round(randomBetween(2, 78)),
    posicaoY: Math.round(randomBetween(2, 78)),
  };
}

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T12:00:00`);
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return `${weekdays[d.getDay()]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatEventDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T12:00:00`);
  return `${d.getDate()} de ${MONTHS_PT[d.getMonth()].slice(0, 3)}`;
}

function relativeTimeMural(tsOrStr) {
  if (!tsOrStr) return '';
  const date = tsOrStr?.toDate ? tsOrStr.toDate() : new Date(tsOrStr);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'agora mesmo';
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'há 1 dia';
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return months === 1 ? 'há 1 mês' : `há ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? 'há 1 ano' : `há ${years} anos`;
}

// ─── Seletor de cores ─────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }) {
  return (
    <div className="mural-color-picker">
      {POSTIT_COLORS.map(color => (
        <button
          key={color.id}
          type="button"
          className={`mural-color-dot${value === color.id ? ' selected' : ''}`}
          style={{ background: color.bg, borderColor: color.border }}
          onClick={() => onChange(color.id)}
          aria-label={color.id}
        />
      ))}
    </div>
  );
}

// ─── Formulário inline ────────────────────────────────────────────────────────

function MuralForm({ tipo, editItem, partnerName, onClose, onSave }) {
  const [titulo, setTitulo] = useState(editItem?.titulo || '');
  const [conteudo, setConteudo] = useState(editItem?.conteudo || '');
  const [cor, setCor] = useState(editItem?.cor || (tipo === 'evento' ? DEFAULT_COLOR_EVENTO : DEFAULT_COLOR_RECADO));
  const [dataEvento, setDataEvento] = useState(editItem?.dataEvento || '');
  const [horaEvento, setHoraEvento] = useState(editItem?.horaEvento || '');
  const [local, setLocal] = useState(editItem?.local || '');
  const [saving, setSaving] = useState(false);

  const isEvento = tipo === 'evento';
  const colorObj = getColor(cor);
  const isValid = titulo.trim() && (!isEvento || dataEvento);

  async function handleSubmit() {
    if (!isValid) return;
    setSaving(true);
    try {
      const base = {
        tipo,
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        cor,
      };

      if (tipo === 'recado') {
        base.destinatario = partnerName;
      }

      if (tipo === 'evento') {
        base.dataEvento = dataEvento;
        base.horaEvento = horaEvento.trim();
        base.local = local.trim();
      }

      if (!editItem) {
        const { posicaoX, posicaoY } = randomPos();
        base.posicaoX = posicaoX;
        base.posicaoY = posicaoY;
        base.rotacao = randomRotation();
      }

      await onSave(base);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card mural-inline-form" style={{ borderTop: `3px solid ${colorObj.border}`, marginBottom: 28 }}>
      <div className="card-title">
        {isEvento ? <Calendar size={14} /> : <NotebookPen size={14} />}
        {editItem ? 'Editar' : 'Registrar'} {isEvento ? 'Evento' : 'Recado'}
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
          <>
            <div>
              <label>
                <span className="label-icon"><Calendar size={13} /></span>
                Data do evento
              </label>
              <AppDatePicker value={dataEvento} onChange={setDataEvento} />
            </div>

            <div>
              <label>
                <span className="label-icon"><Clock size={13} /></span>
                Horário
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>(opcional)</span>
              </label>
              <AppTimePicker value={horaEvento} onChange={setHoraEvento} />
            </div>

            <div className="form-full">
              <label>
                <span className="label-icon"><MapPin size={13} /></span>
                Local
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>(opcional)</span>
              </label>
              <input
                type="text"
                value={local}
                onChange={e => setLocal(e.target.value)}
                placeholder="Onde vai ser?"
              />
            </div>
          </>
        )}

        <div className="form-full">
          <label>Cor do post-it</label>
          <ColorPicker value={cor} onChange={setCor} />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !isValid}>
          <Pin size={14} strokeWidth={2.5} />
          {saving ? 'Pregando...' : 'Pregar no mural'}
        </button>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Modal de detalhes do post-it ────────────────────────────────────────────

function MuralDetailModal({ item, myUid, isLiked = false, onReaction, onClose, onEdit, onDelete }) {
  const overlayRef = useRef(null);
  const colorObj = getColor(item.cor);
  const isOwner = item.createdBy === myUid;
  const isEvento = item.tipo === 'evento';

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const eventDateLabel = isEvento && item.dataEvento ? formatEventDate(item.dataEvento) : '';
  const eventTimeLabel = isEvento && item.horaEvento ? item.horaEvento.replace(':', 'h') : '';

  return (
    <LayerPortal>
      <div
        className="modal-overlay show"
        ref={overlayRef}
        onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
      >
        <div
          className="modal mural-detail-modal"
          style={{ '--postit-accent': colorObj.border, '--postit-accent-bg': colorObj.bg, background: colorObj.bg }}
        >
          {/* Barra de acento colorida no topo */}
          <div className="mural-detail-accent-bar" />

          {/* Header */}
          <div className="mural-detail-header">
            <div className="mural-detail-header-left">
              {isEvento ? (
                <span className="mural-detail-icon-badge" style={{ background: '#fff' }}>
                  <Calendar size={15} color={colorObj.ink} />
                </span>
              ) : (
                <button
                  type="button"
                  className={`mural-detail-icon-badge mural-detail-reaction-btn${isLiked ? ' is-liked' : ''}`}
                  style={{ background: '#fff', color: colorObj.border }}
                  onClick={onReaction}
                  aria-label={isLiked ? 'Remover curtida do recado' : 'Curtir recado'}
                  aria-pressed={isLiked}
                >
                  <Heart size={15} color="currentColor" fill={isLiked ? 'currentColor' : 'none'} />
                </button>
              )}
              <span className="mural-detail-type" style={{ color: colorObj.ink }}>
                {isEvento ? 'Evento' : 'Recado'}
              </span>
            </div>
            <button className="modal-close" onClick={onClose} style={{ color: colorObj.ink }}><X size={16} /></button>
          </div>

          {/* Corpo */}
          <div className={`mural-detail-body${!isEvento && !item.conteudo ? ' mural-detail-body--centered' : ''}`}>
            <div className={`mural-detail-titulo${!isEvento && !item.conteudo ? ' mural-detail-titulo--centered' : ''}`}>{item.titulo}</div>

            {item.conteudo ? (
              <div className="mural-detail-conteudo">{item.conteudo}</div>
            ) : null}

            {(isEvento && (eventDateLabel || eventTimeLabel || item.local)) && (
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
                {item.local && (
                  <div className="mural-detail-info-row">
                    <span className="mural-detail-info-icon" style={{ background: '#fff' }}>
                      <MapPin size={13} color="var(--text-muted)" />
                    </span>
                    <span>{item.local}</span>
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

          {/* Footer */}
          <div className="mural-detail-footer">
            {!isEvento && (
              <div className="mural-detail-meta">
                <Clock size={12} />
                <span>{relativeTimeMural(item.criadoEm)}</span>
              </div>
            )}

            {isOwner && (
              <div className="mural-detail-actions">
                <button className="btn btn-secondary btn-sm" onClick={onEdit}>
                  <Pencil size={13} />
                  Editar
                </button>
                <button className="btn btn-secondary btn-sm danger-btn" onClick={onDelete}>
                  <Trash2 size={13} />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayerPortal>
  );
}

// ─── Post-it ──────────────────────────────────────────────────────────────────

function PostIt({ item, onClick, onMouseDown, isDragging = false, style }) {
  const colorObj = getColor(item.cor);
  const isEvento = item.tipo === 'evento';

  return (
    <div
      className={`postit ${isEvento ? 'postit--evento' : 'postit--recado'}${isDragging ? ' is-dragging' : ''}`}
      style={{
        '--postit-bg': colorObj.bg,
        '--postit-border': colorObj.border,
        transform: `rotate(${item.rotacao || 0}deg)`,
        ...style,
      }}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div className="postit-pin">
        <span className="postit-pin-head" />
        <span className="postit-pin-cap" />
        <span className="postit-pin-needle" />
      </div>

      <div className="postit-type-badge">
        {isEvento ? <Calendar size={11} /> : <Heart size={11} />}
      </div>

      <div className="postit-titulo">{item.titulo}</div>

      {item.conteudo ? (
        <div className="postit-conteudo">{item.conteudo}</div>
      ) : null}

      <div className="postit-footer">
        <span>{item.createdByName || '—'}</span>
        {isEvento && item.dataEvento && (
          <span className="postit-data">{formatEventDateShort(item.dataEvento)}</span>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

function isRecadoViewedByUser(item, uid) {
  if (!uid || item?.tipo !== 'recado') return false;
  return Array.isArray(item.visualizadoPor) && item.visualizadoPor.includes(uid);
}

function isRecadoViewedByPartner(item) {
  if (item?.tipo !== 'recado') return false;
  if (!Array.isArray(item.visualizadoPor)) return false;
  return item.visualizadoPor.some(uid => uid && uid !== item.createdBy);
}

function isRecadoLikedByUser(item, uid) {
  if (!uid || item?.tipo !== 'recado') return false;
  return Array.isArray(item.curtidoPor) && item.curtidoPor.includes(uid);
}

function withRecadoReaction(item, uid, shouldReact) {
  if (!item || !uid || item.tipo !== 'recado') return item;

  const curtidoPor = Array.isArray(item.curtidoPor) ? item.curtidoPor : [];
  const nextCurtidoPor = shouldReact
    ? Array.from(new Set([...curtidoPor, uid]))
    : curtidoPor.filter(itemUid => itemUid !== uid);

  return {
    ...item,
    curtidoPor: nextCurtidoPor,
  };
}

function MuralPostIt({
  item,
  onClick,
  onMouseDown,
  onReaction,
  isDragging = false,
  isViewed = false,
  isLiked = false,
  style,
}) {
  const colorObj = getColor(item.cor);
  const isEvento = item.tipo === 'evento';
  const showViewedBadge = !isEvento && isViewed;
  const eventMeta = item.dataEvento
    ? `${formatEventDateShort(item.dataEvento)}${item.horaEvento ? ` · ${item.horaEvento}` : ''}`
    : '';

  return (
    <div
      className={`postit ${isEvento ? 'postit--evento' : 'postit--recado'}${isDragging ? ' is-dragging' : ''}${isViewed ? ' postit--viewed' : ''}${isLiked ? ' postit--liked' : ''}`}
      style={{
        '--postit-rotation': `${item.rotacao || 0}deg`,
        '--postit-bg': colorObj.bg,
        '--postit-border': colorObj.border,
        transform: 'rotate(var(--postit-rotation))',
        ...style,
      }}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div className="postit-pin">
        <span className="postit-pin-head" />
        <span className="postit-pin-cap" />
        <span className="postit-pin-needle" />
      </div>

      {isEvento ? (
        <div className="postit-type-badge">
          <Calendar size={11} />
        </div>
      ) : (
        <button
          type="button"
          className={`postit-type-badge postit-reaction-btn${isLiked ? ' is-liked' : ''}`}
          onClick={onReaction}
          onMouseDown={event => event.stopPropagation()}
          aria-label={isLiked ? 'Remover curtida do recado' : 'Curtir recado'}
          aria-pressed={isLiked}
        >
          <Heart size={11} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      )}

      {showViewedBadge ? (
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
}

function getReactionOrigin(event) {
  const target = event?.currentTarget;
  const originEl = target?.closest?.('.postit') || target;
  if (!originEl?.getBoundingClientRect) return null;

  const rect = originEl.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function areMuralPositionsClose(a, b) {
  if (!a || !b) return false;
  return Math.abs(a.x - b.x) < 0.05 && Math.abs(a.y - b.y) < 0.05;
}

function RomanceReactionBurst({ origin }) {
  const hearts = [
    { x: '-88px', y: '-34px', r: '-24deg', s: '0.72', d: '0ms' },
    { x: '-46px', y: '-82px', r: '18deg', s: '0.9', d: '45ms' },
    { x: '0px', y: '-104px', r: '-6deg', s: '1.08', d: '10ms' },
    { x: '48px', y: '-78px', r: '22deg', s: '0.82', d: '70ms' },
    { x: '86px', y: '-30px', r: '-14deg', s: '0.68', d: '30ms' },
    { x: '-20px', y: '-42px', r: '10deg', s: '0.62', d: '110ms' },
  ];

  return (
    <div
      className="mural-romance-burst"
      style={{
        '--mural-burst-x': `${origin?.x ?? 0}px`,
        '--mural-burst-y': `${origin?.y ?? 0}px`,
      }}
      aria-hidden="true"
    >
      {hearts.map((heart, index) => (
        <Heart
          key={index}
          className="mural-romance-heart"
          size={30}
          fill="currentColor"
          strokeWidth={2.2}
          style={{
            '--mural-heart-x': heart.x,
            '--mural-heart-y': heart.y,
            '--mural-heart-rotate': heart.r,
            '--mural-heart-scale': heart.s,
            '--mural-heart-delay': heart.d,
          }}
        />
      ))}
    </div>
  );
}

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'recado', label: 'Recados' },
  { id: 'evento', label: 'Eventos' },
];

function getDesktopPostItPosition(item, idx) {
  const fallbackX = (idx * 12) % 80;
  const fallbackY = (idx * 18) % 80;
  const x = Math.max(2, Math.min(78, item.posicaoX ?? fallbackX));
  const y = Math.max(2, Math.min(70, (item.posicaoY ?? fallbackY) - 10));

  return { x, y };
}

function getDesktopPostItStyle(item, idx, total, overridePosition, isDragging = false) {
  const position = overridePosition || getDesktopPostItPosition(item, idx);

  return {
    '--postit-rotation': `${item.rotacao || 0}deg`,
    left: `${position.x}%`,
    top: `${position.y}%`,
    zIndex: isDragging ? total + 100 : total - idx,
  };
}

// formOpen: null | 'recado' | 'evento'
export default function MuralPage() {
  const { user } = useAuth();
  const { config, currentMember, partnerMember } = useCouple();
  const {
    mural,
    muralReady,
    ensureMuralLoaded,
    addMuralItem,
    updateMuralItem,
    toggleMuralReaction,
    removeMuralItem,
  } = useCoupleMural();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  const [filter, setFilter] = useState('todos');
  const [formOpen, setFormOpen] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [reactionBurst, setReactionBurst] = useState(null);
  const [dragPositions, setDragPositions] = useState({});
  const boardRef = useRef(null);
  const dragStateRef = useRef(null);
  const dragFrameRef = useRef(null);
  const dragPendingPositionRef = useRef(null);
  const pendingDragPositionsRef = useRef({});
  const suppressClickRef = useRef(null);
  const reactionTimerRef = useRef(null);

  useEffect(() => {
    ensureMuralLoaded();
  }, [ensureMuralLoaded]);

  useEffect(() => () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    if (dragFrameRef.current) cancelAnimationFrame(dragFrameRef.current);
  }, []);

  const triggerReactionBurst = useCallback((origin) => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);

    const fallbackOrigin = typeof window === 'undefined'
      ? { x: 0, y: 0 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    setReactionBurst({ id: Date.now(), origin: origin || fallbackOrigin });
    reactionTimerRef.current = setTimeout(() => {
      setReactionBurst(null);
      reactionTimerRef.current = null;
    }, 1000);
  }, []);

  const partnerName = useMemo(() => {
    if (currentMember?.role === 'owner') return String(config.name2 || '').trim() || partnerMember?.name || 'Parceiro(a)';
    return String(config.name1 || '').trim() || partnerMember?.name || 'Parceiro(a)';
  }, [config, currentMember, partnerMember]);

  const sorted = useMemo(
    () => [...mural].sort((a, b) => {
      const ta = a.criadoEm?.toDate ? a.criadoEm.toDate().getTime() : new Date(a.criadoEm || 0).getTime();
      const tb = b.criadoEm?.toDate ? b.criadoEm.toDate().getTime() : new Date(b.criadoEm || 0).getTime();
      return tb - ta;
    }),
    [mural],
  );

  const filtered = useMemo(
    () => (filter === 'todos' ? sorted : sorted.filter(item => item.tipo === filter)),
    [sorted, filter],
  );

  const recadosCount = useMemo(() => mural.filter(i => i.tipo === 'recado').length, [mural]);
  const eventosCount = useMemo(() => mural.filter(i => i.tipo === 'evento').length, [mural]);

  useEffect(() => {
    setDragPositions(current => {
      const draggingItemId = dragStateRef.current?.itemId || draggingId;
      const next = {};
      let changed = false;

      mural.forEach((item, idx) => {
        if (draggingItemId && item.id === draggingItemId && current[item.id]) {
          next[item.id] = current[item.id];
          return;
        }

        const syncedPosition = getDesktopPostItPosition(item, idx);
        const pendingPosition = pendingDragPositionsRef.current[item.id];

        if (pendingPosition) {
          if (areMuralPositionsClose(syncedPosition, pendingPosition)) {
            delete pendingDragPositionsRef.current[item.id];
          } else {
            next[item.id] = pendingPosition;
            const previous = current[item.id];
            if (!previous || previous.x !== pendingPosition.x || previous.y !== pendingPosition.y) {
              changed = true;
            }
            return;
          }
        }

        next[item.id] = syncedPosition;

        const previous = current[item.id];
        if (!previous || previous.x !== syncedPosition.x || previous.y !== syncedPosition.y) {
          changed = true;
        }
      });

      if (Object.keys(current).length !== Object.keys(next).length) {
        changed = true;
      }

      return changed ? next : current;
    });
  }, [draggingId, mural]);

  function openForm(tipo) {
    setEditItem(null);
    setFormOpen(tipo);
  }

  function closeForm() {
    setFormOpen(null);
    setEditItem(null);
  }

  async function handleSaveNew(data) {
    try {
      await addMuralItem(data);
      showToast('Post-it pregado no mural.');
    } catch {
      showToast('Não foi possível salvar no mural.');
      throw new Error('save failed');
    }
  }

  async function handleSaveEdit(data) {
    try {
      await updateMuralItem(editItem.id, data);
      setDetailItem(null);
      showToast('Post-it atualizado.');
    } catch {
      showToast('Não foi possível atualizar.');
      throw new Error('save failed');
    }
  }

  function handleEditClick() {
    if (!detailItem) return;
    setEditItem(detailItem);
    setFormOpen(detailItem.tipo);
    setDetailItem(null);
  }

  function handleDeleteClick() {
    if (!detailItem) return;
    const target = detailItem;
    showConfirm('Deseja remover este post-it do mural?', async () => {
      try {
        await removeMuralItem(target.id);
        setDetailItem(null);
        showToast('Post-it removido.');
      } catch {
        showToast('Não foi possível remover.');
      }
    });
  }

  const closeDetail = useCallback(() => setDetailItem(null), []);

  const markRecadoAsViewed = useCallback(async (item) => {
    if (!user?.uid || item?.tipo !== 'recado' || item.createdBy === user.uid) return;
    const visualizadoPor = Array.isArray(item.visualizadoPor) ? item.visualizadoPor : [];
    if (visualizadoPor.includes(user.uid)) return;

    try {
      await updateMuralItem(item.id, {
        visualizadoPor: [...visualizadoPor, user.uid],
      });
    } catch {
      // silencioso para nao poluir a experiencia ao abrir o post-it
    }
  }, [updateMuralItem, user?.uid]);

  const handleToggleReaction = useCallback(async (item, event) => {
    event?.stopPropagation();
    if (!user?.uid || item?.tipo !== 'recado') return;

    const reactionOrigin = getReactionOrigin(event);
    const nextLiked = !isRecadoLikedByUser(item, user.uid);
    setDetailItem(current => (
      current?.id === item.id ? withRecadoReaction(current, user.uid, nextLiked) : current
    ));

    if (nextLiked) triggerReactionBurst(reactionOrigin);

    try {
      await toggleMuralReaction(item.id, nextLiked);
    } catch {
      setDetailItem(current => (
        current?.id === item.id ? withRecadoReaction(current, user.uid, !nextLiked) : current
      ));
      showToast('Nao foi possivel reagir agora.');
    }
  }, [showToast, toggleMuralReaction, triggerReactionBurst, user?.uid]);

  const persistDraggedPosition = useCallback(async (itemId, nextPosition, previousPosition) => {
    try {
      await updateMuralItem(itemId, {
        posicaoX: Number(nextPosition.x.toFixed(2)),
        posicaoY: Number((nextPosition.y + 10).toFixed(2)),
      });
    } catch {
      delete pendingDragPositionsRef.current[itemId];
      setDragPositions(current => ({
        ...current,
        [itemId]: previousPosition,
      }));
      showToast('Nao foi possivel mover o post-it.');
    }
  }, [showToast, updateMuralItem]);

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
    dragPendingPositionRef.current = {
      itemId: drag.itemId,
      position: nextPosition,
    };

    if (dragFrameRef.current) return;

    dragFrameRef.current = requestAnimationFrame(() => {
      const pending = dragPendingPositionRef.current;
      dragFrameRef.current = null;
      dragPendingPositionRef.current = null;

      if (!pending) return;

      setDragPositions(current => {
        const previous = current[pending.itemId];
        if (previous && previous.x === pending.position.x && previous.y === pending.position.y) {
          return current;
        }

        return {
          ...current,
          [pending.itemId]: pending.position,
        };
      });
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    const drag = dragStateRef.current;
    if (!drag) return;

    dragStateRef.current = null;
    if (dragFrameRef.current) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
      dragPendingPositionRef.current = null;
    }
    setDraggingId(null);

    if (!drag.hasMoved || !drag.latestPosition) return;
    pendingDragPositionsRef.current[drag.itemId] = drag.latestPosition;
    setDragPositions(current => ({
      ...current,
      [drag.itemId]: drag.latestPosition,
    }));
    void persistDraggedPosition(drag.itemId, drag.latestPosition, drag.originalPosition);
  }, [persistDraggedPosition]);

  useEffect(() => {
    if (!draggingId) return undefined;

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [draggingId, handleDragEnd, handleDragMove]);


  function handleDesktopDragStart(item, idx, event) {
    if (window.innerWidth <= 768 || event.button !== 0) return;

    const boardEl = boardRef.current;
    if (!boardEl) return;

    event.preventDefault();

    const cardRect = event.currentTarget.getBoundingClientRect();
    const currentPosition = dragPositions[item.id] || getDesktopPostItPosition(item, idx);

    dragStateRef.current = {
      itemId: item.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      pointerOffsetX: event.clientX - cardRect.left,
      pointerOffsetY: event.clientY - cardRect.top,
      cardWidth: cardRect.width,
      cardHeight: cardRect.height,
      originalPosition: currentPosition,
      latestPosition: currentPosition,
      hasMoved: false,
    };

    setDraggingId(item.id);
    setDragPositions(current => ({
      ...current,
      [item.id]: currentPosition,
    }));
  }

  function handlePostItClick(item) {
    if (suppressClickRef.current === item.id) {
      suppressClickRef.current = null;
      return;
    }

    void markRecadoAsViewed(item);
    setDetailItem(item);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Nosso Mural</h1>
        <p>
          <Pin size={14} color="var(--rosa-400)" />
          Recados, planos e tudo que o casal quer lembrar
        </p>
      </div>

      {/* Formulário inline (criação ou edição) */}
      {formOpen && (
        <MuralForm
          tipo={formOpen}
          editItem={editItem}
          partnerName={partnerName}
          onClose={closeForm}
          onSave={editItem ? handleSaveEdit : handleSaveNew}
        />
      )}

      {/* Controles: botões + filtros lado a lado */}
      {!formOpen && (
        <div className="mural-controls">
          <div className="mural-action-row">
            <button className="btn btn-primary btn-sm" onClick={() => openForm('recado')}>
              <NotebookPen size={14} strokeWidth={2.5} />
              Registrar Recado
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => openForm('evento')}>
              <Calendar size={14} />
              Registrar Evento
            </button>
          </div>

          <div className="filter-chips">
            {FILTERS.map(f => (
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
      )}

      {/* Contador */}
      {mural.length > 0 && (
        <div className="card-title mural-counter">
          {recadosCount > 0 && `${recadosCount} ${recadosCount === 1 ? 'recado' : 'recados'}`}
          {recadosCount > 0 && eventosCount > 0 && ' · '}
          {eventosCount > 0 && `${eventosCount} ${eventosCount === 1 ? 'evento' : 'eventos'}`}
        </div>
      )}

      {/* Conteúdo */}
      {!muralReady ? (
        <div className="empty-state">
          <div className="empty-icon"><Pin size={38} /></div>
          <h3>Carregando o mural...</h3>
          <p>Estamos buscando os post-its de vocês.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Pin size={48} /></div>
          <h3 className="mural-empty-title">
            {mural.length === 0 ? 'O mural de vocês está esperando' : 'Nenhum post-it aqui'}
          </h3>
          <p>
            {mural.length === 0
              ? 'Deixem recados, anotem eventos e preencham esse espaço com a cara do casal'
              : 'Tente outro filtro ou adicione um novo post-it'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: mural livre */}
          <div className={`mural-board${draggingId ? ' is-dragging' : ''}`} ref={boardRef}>
            {filtered.map((item, idx) => (
              <MuralPostIt
                key={item.id}
                item={item}
                onClick={() => handlePostItClick(item)}
                onMouseDown={event => handleDesktopDragStart(item, idx, event)}
                onReaction={event => handleToggleReaction(item, event)}
                isDragging={draggingId === item.id}
                isViewed={isRecadoViewedByPartner(item)}
                isLiked={isRecadoLikedByUser(item, user?.uid)}
                style={getDesktopPostItStyle(
                  item,
                  idx,
                  filtered.length,
                  dragPositions[item.id],
                  draggingId === item.id,
                )}
              />
            ))}
          </div>

          {/* Mobile: grid 2 colunas */}
          <div className="mural-grid">
            {filtered.map(item => (
              <MuralPostIt
                key={item.id}
                item={item}
                onClick={() => handlePostItClick(item)}
                onReaction={event => handleToggleReaction(item, event)}
                isViewed={isRecadoViewedByPartner(item)}
                isLiked={isRecadoLikedByUser(item, user?.uid)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal de detalhes */}
      {detailItem && !formOpen && (
        <MuralDetailModal
          item={detailItem}
          myUid={user?.uid}
          isLiked={isRecadoLikedByUser(detailItem, user?.uid)}
          onReaction={event => handleToggleReaction(detailItem, event)}
          onClose={closeDetail}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {reactionBurst ? <RomanceReactionBurst key={reactionBurst.id} origin={reactionBurst.origin} /> : null}
    </div>
  );
}
