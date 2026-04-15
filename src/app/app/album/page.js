'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, FileText, Image as ImageIcon, Plus, Trash2, Type, UploadCloud, X } from 'lucide-react';
import { useCouple } from '@/contexts/CoupleContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import AppDatePicker from '@/components/common/AppDatePicker';
import PhotoLightbox from '@/components/common/PhotoLightbox';
import { formatDatePt, todayLocalDate } from '@/lib/dateUtils';
import { resizeImage } from '@/lib/imageUtils';

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'month', label: 'Este Mês' },
  { id: 'year', label: 'Este Ano' },
];

export default function AlbumPage() {
  const fileInputRef = useRef(null);
  const { album, albumReady, ensureAlbumLoaded, addPhoto, removePhoto } = useCouple();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [date, setDate] = useState(todayLocalDate);
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    ensureAlbumLoaded();
  }, [ensureAlbumLoaded]);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const filteredPhotos = useMemo(() => {
    const now = new Date();
    let items = [...album];

    if (filter === 'month') {
      items = items.filter(item => {
        const itemDate = new Date(`${item.date}T12:00:00`);
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      });
    }

    if (filter === 'year') {
      items = items.filter(item => new Date(`${item.date}T12:00:00`).getFullYear() === now.getFullYear());
    }

    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [album, filter]);

  function resetForm() {
    setDate(todayLocalDate());
    setCaption('');
    setDescription('');
    setPhotoFile(null);
    setPhotoPreview('');
    setDragOver(false);
  }

  function openForm() {
    resetForm();
    setFormOpen(true);
  }

  function closeForm() {
    resetForm();
    setFormOpen(false);
  }

  async function handleFile(file) {
    if (!file) return;
    try {
      const preview = await resizeImage(file, 720);
      setPhotoFile(file);
      setPhotoPreview(preview.dataUrl);
    } catch {
      showToast('Não foi possível preparar a prévia da foto.');
    }
  }

  async function save() {
    if (!photoFile) {
      showToast('Selecione uma foto primeiro.');
      return;
    }

    if (!date) {
      showToast('Informe a data da foto.');
      return;
    }

    setSaving(true);

    try {
      await addPhoto(photoFile, {
        caption: caption.trim(),
        date,
        description: description.trim(),
      });
      closeForm();
      showToast('Foto salva no álbum.');
    } catch {
      showToast('Não foi possível salvar essa foto.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(photo) {
    showConfirm('Deseja remover esta foto do álbum?', async () => {
      try {
        await removePhoto(photo);
        showToast('Foto removida.');
      } catch {
        showToast('Não foi possível remover a foto.');
      }
    });
  }

  const memoriesLabel =
    filteredPhotos.length === 1 ? '1 memória guardada' : `${filteredPhotos.length} memórias guardadas`;

  return (
    <div>
      <div className="page-header">
        <h1>Nosso Álbum</h1>
        <p>
          <ImageIcon size={14} color="var(--rosa-400)" /> As memórias mais especiais de vocês dois
        </p>
      </div>

      {formOpen && (
        <div className="card album-form-card" style={{ marginBottom: 28 }}>
          <div className="card-title">
            <ImageIcon size={14} /> Nova foto
          </div>

          <div
            className={`upload-area${dragOver ? ' drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={event => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={event => {
              event.preventDefault();
              setDragOver(false);
              handleFile(event.dataTransfer.files?.[0]);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={event => handleFile(event.target.files?.[0])}
            />

            {photoPreview ? (
              <div className="upload-preview">
                <img src={photoPreview} alt="Prévia da foto" />
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
              <div className="upload-placeholder">
                <UploadCloud size={40} color="var(--rosa-300)" />
                <p>Clique ou arraste uma foto aqui</p>
                <span>JPG, PNG ou WEBP</span>
              </div>
            )}
          </div>

          <div className="form-grid" style={{ marginTop: 24 }}>
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
                Legenda
              </label>
              <input
                type="text"
                value={caption}
                onChange={event => setCaption(event.target.value)}
                placeholder="Uma legenda especial..."
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
                placeholder="Conte mais sobre esse momento..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar No Álbum'}
            </button>
            <button className="btn btn-secondary" onClick={closeForm}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="album-controls">
        <button className="btn btn-primary btn-sm" onClick={openForm}>
          <Plus size={14} strokeWidth={2.5} />
          Adicionar Foto
        </button>

        <div className="album-filters">
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
      </div>

      <div className="album-count">{memoriesLabel}</div>

      <div className="album-grid">
        {!albumReady ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon">
              <ImageIcon size={38} />
            </div>
            <h3>Carregando álbum</h3>
            <p>Estamos preparando as memórias de vocês.</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon">
              <ImageIcon size={38} />
            </div>
            <h3>Nenhuma foto ainda</h3>
            <p>Adicionem fotos dos momentos especiais de vocês.</p>
          </div>
        ) : (
          filteredPhotos.map(photo => {
            const cardSrc = photo.thumbUrl || photo.url;
            const lightboxSrc = photo.url || photo.thumbUrl;

            return (
              <div className="photo-card" key={photo.id}>
                <img
                  className="photo-card-img"
                  src={cardSrc}
                  alt={photo.caption || 'Foto do casal'}
                  loading="lazy"
                  decoding="async"
                  onClick={() =>
                    setLightboxItem({
                      src: lightboxSrc,
                      caption: photo.caption,
                      dateLabel: formatDatePt(photo.date),
                    })
                  }
                />

                <button className="photo-delete-btn" onClick={() => confirmDelete(photo)}>
                  <Trash2 size={13} />
                </button>

                <div className="photo-card-body">
                  {photo.caption && <div className="photo-card-caption">{photo.caption}</div>}
                  <div className="photo-card-date">{formatDatePt(photo.date)}</div>
                  {photo.description && <div className="photo-card-desc">"{photo.description}"</div>}
                  {photo.createdByName && <div className="photo-card-meta">Adicionado por {photo.createdByName}</div>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <PhotoLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </div>
  );
}
