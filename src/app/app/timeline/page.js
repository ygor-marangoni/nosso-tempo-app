'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Camera,
  Check,
  FileText,
  Heart,
  Milestone,
  Pencil,
  Plus,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { useCouple } from '@/contexts/CoupleContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import AppDatePicker from '@/components/common/AppDatePicker';
import PhotoLightbox from '@/components/common/PhotoLightbox';
import { formatDatePt, relativeTime, timeBetween } from '@/lib/dateUtils';
import { resizeImage } from '@/lib/imageUtils';

export default function TimelinePage() {
  const newPhotoInputRef = useRef(null);
  const editPhotoInputRef = useRef(null);
  const { timeline, timelineReady, ensureTimelineLoaded, addMilestone, removeMilestone, updateMilestone } = useCouple();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const [clearEditPhoto, setClearEditPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    ensureTimelineLoaded();
  }, [ensureTimelineLoaded]);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
      if (editPhotoPreview.startsWith('blob:')) URL.revokeObjectURL(editPhotoPreview);
    };
  }, [editPhotoPreview, photoPreview]);

  const items = useMemo(() => [...timeline].sort((a, b) => b.date.localeCompare(a.date)), [timeline]);

  function resetCreateForm() {
    setDate('');
    setTitle('');
    setDescription('');
    setPhotoFile(null);
    setPhotoPreview('');
  }

  function closeCreateForm() {
    resetCreateForm();
    setFormOpen(false);
  }

  async function handleNewPhoto(file) {
    if (!file) return;
    try {
      const preview = await resizeImage(file, 720);
      setPhotoFile(file);
      setPhotoPreview(preview.dataUrl);
    } catch {
      showToast('Não foi possível preparar a prévia da foto.');
    }
  }

  async function handleEditPhoto(file) {
    if (!file) return;
    try {
      const preview = await resizeImage(file, 720);
      setEditPhotoFile(file);
      setEditPhotoPreview(preview.dataUrl);
      setClearEditPhoto(false);
    } catch {
      showToast('Não foi possível preparar a prévia da foto.');
    }
  }

  async function saveNewMilestone() {
    if (!date || !title.trim()) {
      showToast('Preencha a data e o título do marco.');
      return;
    }

    setSaving(true);

    try {
      await addMilestone(
        {
          date,
          desc: description.trim(),
          title: title.trim(),
        },
        photoFile,
      );
      closeCreateForm();
      showToast('Marco salvo na linha do tempo.');
    } catch {
      showToast('Não foi possível salvar o marco.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditDate(item.date);
    setEditTitle(item.title);
    setEditDescription(item.desc || '');
    setEditPhotoFile(null);
    setEditPhotoPreview(item.photoThumbUrl || item.photoUrl || '');
    setClearEditPhoto(false);
  }

  function cancelEdit() {
    setEditingId('');
    setEditDate('');
    setEditTitle('');
    setEditDescription('');
    setEditPhotoFile(null);
    setEditPhotoPreview('');
    setClearEditPhoto(false);
  }

  async function saveEdit() {
    if (!editDate || !editTitle.trim()) {
      showToast('Preencha a data e o título do marco.');
      return;
    }

    setSaving(true);

    try {
      await updateMilestone(
        editingId,
        {
          date: editDate,
          desc: editDescription.trim(),
          title: editTitle.trim(),
        },
        editPhotoFile,
        clearEditPhoto,
      );
      cancelEdit();
      showToast('Marco atualizado.');
    } catch {
      showToast('Não foi possível atualizar o marco.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(item) {
    showConfirm('Deseja remover este marco?', async () => {
      try {
        await removeMilestone(item);
        showToast('Marco removido.');
      } catch {
        showToast('Não foi possível remover o marco.');
      }
    });
  }

  const countLabel =
    items.length === 0 ? '' : items.length === 1 ? '1 marco na história de vocês' : `${items.length} marcos na história de vocês`;

  return (
    <div>
      <div className="page-header">
        <h1>Nossa Linha do Tempo</h1>
        <p>
          <Milestone size={14} color="var(--rosa-400)" /> Revivam cada capítulo dessa história
        </p>
      </div>

      {formOpen && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="card-title">
            <Plus size={14} /> Novo marco
          </div>

          <div className="form-grid">
            <div>
              <label>
                <span className="label-icon">
                  <Calendar size={13} />
                </span>
                Data
              </label>
              <AppDatePicker value={date} onChange={setDate} />
            </div>

            <div>
              <label>
                <span className="label-icon">
                  <Type size={13} />
                </span>
                Título do marco
              </label>
              <input
                type="text"
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder="Ex: Nosso primeiro beijo"
              />
            </div>

            <div className="form-full">
              <label>
                <span className="label-icon">
                  <FileText size={13} />
                </span>
                Descrição <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="Conte como foi esse momento especial..."
              />
            </div>

            <div className="form-full">
              <label>
                <span className="label-icon">
                  <Camera size={13} />
                </span>
                Foto <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span>
              </label>
              <div className="upload-area ms-upload-area" onClick={() => newPhotoInputRef.current?.click()}>
                <input
                  ref={newPhotoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={event => handleNewPhoto(event.target.files?.[0])}
                />

                {photoPreview ? (
                  <div className="upload-preview">
                    <img src={photoPreview} alt="Prévia do marco" />
                    <button
                      className="preview-remove"
                      onClick={event => {
                        event.stopPropagation();
                        setPhotoFile(null);
                        setPhotoPreview('');
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder ms-upload-placeholder">
                    <Camera size={30} color="var(--rosa-300)" />
                    <p>Clique para adicionar uma foto</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={saveNewMilestone} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Marco'}
            </button>
            <button className="btn btn-secondary" onClick={closeCreateForm}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setFormOpen(true)}>
          <Plus size={14} />
          Adicionar Marco
        </button>
      </div>

      {countLabel && <div className="milestone-count">{countLabel}</div>}

      {!timelineReady ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Heart size={38} />
          </div>
          <h3>Carregando linha do tempo</h3>
          <p>Estamos organizando os marcos de vocês.</p>
        </div>
      ) : !items.length ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Heart size={38} />
          </div>
          <h3>A história de vocês começa aqui</h3>
          <p>Adicionem os marcos mais importantes do relacionamento.</p>
        </div>
      ) : (
        <div className="tl-wrap">
          <div className="tl-vline"></div>

          {items.map((item, index) => {
            const side = index % 2 === 0 ? 'tl-left' : 'tl-right';
            const isNewest = index === 0;
            const isOldest = index === items.length - 1;
            const dotClass = isNewest ? 'tl-dot tl-dot-pulse' : isOldest ? 'tl-dot tl-dot-first' : 'tl-dot';
            const isEditing = editingId === item.id;

            return (
              <div key={item.id}>
                <div className={`tl-item ${side}`}>
                  <div className="tl-center">
                    <div className={dotClass}></div>
                  </div>

                  <div className="tl-card-wrap">
                    {isEditing ? (
                      <div className="milestone-card milestone-card-edit">
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
                                <Type size={13} />
                              </span>
                              Título
                            </label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={event => setEditTitle(event.target.value)}
                              placeholder="Título do marco"
                            />
                          </div>

                          <div className="form-full">
                            <label>
                              <span className="label-icon">
                                <FileText size={13} />
                              </span>
                              Descrição
                            </label>
                            <textarea
                              value={editDescription}
                              onChange={event => setEditDescription(event.target.value)}
                              placeholder="Conte como foi esse momento..."
                            />
                          </div>

                          <div className="form-full">
                            <label>
                              <span className="label-icon">
                                <Camera size={13} />
                              </span>
                              Foto <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span>
                            </label>
                            <div className="upload-area ms-upload-area ms-upload-area-sm" onClick={() => editPhotoInputRef.current?.click()}>
                              <input
                                ref={editPhotoInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                hidden
                                onChange={event => handleEditPhoto(event.target.files?.[0])}
                              />

                              {editPhotoPreview && !clearEditPhoto ? (
                                <div className="upload-preview">
                                  <img src={editPhotoPreview} alt="Prévia da foto do marco" />
                                  <button
                                    className="preview-remove"
                                    onClick={event => {
                                      event.stopPropagation();
                                      setEditPhotoFile(null);
                                      setEditPhotoPreview('');
                                      setClearEditPhoto(true);
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="upload-placeholder ms-upload-placeholder">
                                  <Camera size={24} color="var(--rosa-300)" />
                                  <p>Clique para adicionar ou trocar a foto</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-actions" style={{ marginTop: 20 }}>
                          <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>
                            <Check size={14} />
                            Salvar
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="milestone-card">
                        <div className="ms-card-actions">
                          <button className="ms-btn-action" onClick={() => startEdit(item)}>
                            <Pencil size={13} />
                          </button>
                          <button className="ms-btn-action ms-btn-delete" onClick={() => confirmDelete(item)}>
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="ms-date">{formatDatePt(item.date)}</div>
                        <div className="ms-title">{item.title}</div>
                        {item.desc && <div className="ms-desc">"{item.desc}"</div>}

                        {(item.photoThumbUrl || item.photoUrl) && (
                          <img
                            className="ms-photo"
                            src={item.photoThumbUrl || item.photoUrl}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            onClick={() =>
                              setLightboxItem({
                                src: item.photoUrl || item.photoThumbUrl,
                                title: item.title,
                                dateLabel: formatDatePt(item.date),
                              })
                            }
                          />
                        )}

                        <div className="ms-relative-time">{relativeTime(item.date)}</div>
                        {item.createdByName && <div className="ms-byline">Adicionado por {item.createdByName}</div>}
                      </div>
                    )}
                  </div>
                </div>

                {index < items.length - 1 && (
                  <div className="tl-between">
                    <span>{timeBetween(items[index + 1].date, item.date)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <PhotoLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </div>
  );
}
