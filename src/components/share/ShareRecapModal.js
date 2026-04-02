'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Download, Image as ImageIcon, Share2, Sparkles, X } from 'lucide-react';
import LayerPortal from '@/components/common/LayerPortal';
import RecapCard from '@/components/share/RecapCard';
import { useCouple } from '@/contexts/CoupleContext';
import { useToast } from '@/contexts/ToastContext';
import { calcMonthRecap } from '@/lib/share/monthRecapUtils';
import { captureCard, downloadPng, shareOrDownload, urlToDataUri } from '@/lib/share/exportUtils';

export default function ShareRecapModal({ onClose }) {
  const {
    config,
    entries,
    entriesReady,
    ensureEntriesLoaded,
    album,
    albumReady,
    ensureAlbumLoaded,
    phrases,
    phrasesReady,
    ensurePhrasesLoaded,
  } = useCouple();
  const { showToast } = useToast();
  const cardRef = useRef(null);

  // ── Estado do composer ───────────────────────────────────────────────────
  const [photoIdx, setPhotoIdx] = useState(0);         // -1 = sem foto
  const [useFullNames, setUseFullNames] = useState(true);
  const [showPhrase, setShowPhrase] = useState(true);
  const [photoDataUri, setPhotoDataUri] = useState(null);
  const [isConvertingPhoto, setIsConvertingPhoto] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ── Garantir dados carregados ────────────────────────────────────────────
  useEffect(() => {
    ensureEntriesLoaded();
    ensureAlbumLoaded();
    ensurePhrasesLoaded();
  }, [ensureEntriesLoaded, ensureAlbumLoaded, ensurePhrasesLoaded]);

  // ── Calcular recap assim que os dados estiverem prontos ──────────────────
  const dataReady = entriesReady && albumReady && phrasesReady;

  const recap = useMemo(() => {
    if (!dataReady) return null;
    return calcMonthRecap({ entries, album, phrases, config });
  }, [dataReady, entries, album, phrases, config]);

  // ── Opções de foto disponíveis ───────────────────────────────────────────
  const photoOptions = recap?.photoOptions || [];

  // ── Converter foto selecionada para data URI ─────────────────────────────
  const convertPhoto = useCallback(async (idx) => {
    if (idx < 0 || !photoOptions[idx]) {
      setPhotoDataUri(null);
      return;
    }
    setIsConvertingPhoto(true);
    const uri = await urlToDataUri(photoOptions[idx].url);
    setPhotoDataUri(uri);
    setIsConvertingPhoto(false);
  }, [photoOptions]);

  // Converte automaticamente a foto inicial quando o recap estiver pronto
  useEffect(() => {
    if (!recap) return;
    const initialIdx = recap.photoOptions.length > 0 ? 0 : -1;
    setPhotoIdx(initialIdx);
    convertPhoto(initialIdx);
  }, [recap]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fechar com Escape ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Travar scroll do body enquanto o modal estiver aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Seleção de foto ──────────────────────────────────────────────────────
  function selectPhoto(idx) {
    if (idx === photoIdx) return;
    setPhotoIdx(idx);
    convertPhoto(idx);
  }

  // ── Exportar e compartilhar ──────────────────────────────────────────────
  async function handleShare() {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await captureCard(cardRef.current);
      const result = await shareOrDownload({
        dataUrl,
        monthName: recap?.monthName,
        name1: config.name1,
        name2: config.name2,
      });
      if (result === 'shared') showToast('Recap compartilhado com sucesso!');
      else if (result === 'downloaded') showToast('Imagem salva na galeria!');
    } catch {
      showToast('Não foi possível gerar a imagem. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDownload() {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await captureCard(cardRef.current);
      downloadPng(dataUrl, `nosso-recap-${recap?.monthName || 'mes'}.png`);
      showToast('Imagem salva!');
    } catch {
      showToast('Não foi possível baixar a imagem.');
    } finally {
      setIsExporting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const isLoading = !dataReady || !recap;
  const hasPhotoOpts = photoOptions.length > 0;

  return (
    <LayerPortal>
      <div className="modal-overlay show recap-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal recap-modal" role="dialog" aria-modal="true" aria-label="Compartilhar recap">

          {/* ── Cabeçalho ── */}
          <div className="modal-header">
            <h2>
              <Sparkles size={18} style={{ color: 'var(--rosa-400)', verticalAlign: 'middle', marginRight: 8, marginTop: -2 }} />
              Nosso Recap
            </h2>
            <button className="modal-close" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>

          {isLoading ? (
            /* ── Estado de carregamento ── */
            <div className="recap-loading">
              <div className="recap-loading-icon">
                <Sparkles size={28} />
              </div>
              <p>Preparando o recap de vocês…</p>
            </div>
          ) : (
            <>
              {/* ── Preview do card ── */}
              <div className="recap-preview-wrap">
                <div className="recap-preview-inner recap-preview-inner--story">
                  {isConvertingPhoto ? (
                    <div className="recap-preview-skeleton" style={{ width: 270, height: 480 }}>
                      <Sparkles size={22} style={{ color: 'var(--rosa-300)' }} />
                      <span>Carregando foto…</span>
                    </div>
                  ) : (
                    <RecapCard
                      recap={recap}
                      showNames={useFullNames}
                      showPhrase={showPhrase}
                      photoDataUri={photoDataUri}
                      cardRef={cardRef}
                    />
                  )}
                </div>
              </div>

              {/* ── Seletor de foto ── */}
              {(hasPhotoOpts || photoIdx !== -1) && (
                <div className="recap-section">
                  <div className="recap-section-label">Foto</div>
                  <div className="recap-photo-opts">
                    {photoOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        className={`recap-photo-opt${photoIdx === idx ? ' selected' : ''}`}
                        onClick={() => selectPhoto(idx)}
                        title={opt.label}
                      >
                        <img src={opt.thumbUrl} alt={opt.label} />
                        {photoIdx === idx && (
                          <div className="recap-photo-opt-check">
                            <Check size={10} />
                          </div>
                        )}
                      </button>
                    ))}
                    <button
                      className={`recap-photo-opt recap-photo-opt--none${photoIdx === -1 ? ' selected' : ''}`}
                      onClick={() => selectPhoto(-1)}
                      title="Sem foto"
                    >
                      <ImageIcon size={16} />
                      {photoIdx === -1 && (
                        <div className="recap-photo-opt-check">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Opções de conteúdo ── */}
              <div className="recap-section">
                <div className="recap-section-label">Conteúdo</div>
                <div className="recap-toggles">
                  <label className="recap-toggle">
                    <input
                      type="checkbox"
                      checked={useFullNames}
                      onChange={e => setUseFullNames(e.target.checked)}
                    />
                    <span className="recap-toggle-track" />
                    <span className="recap-toggle-label">
                      {useFullNames ? 'Nomes completos' : 'Somente iniciais'}
                    </span>
                  </label>

                  {recap?.phrase && (
                    <label className="recap-toggle">
                      <input
                        type="checkbox"
                        checked={showPhrase}
                        onChange={e => setShowPhrase(e.target.checked)}
                      />
                      <span className="recap-toggle-track" />
                      <span className="recap-toggle-label">
                        {showPhrase ? 'Frase incluída' : 'Sem frase'}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* ── Ações ── */}
              <div className="recap-actions">
                <button
                  className="btn btn-primary recap-btn-main"
                  onClick={handleShare}
                  disabled={isExporting || isConvertingPhoto}
                >
                  <Share2 size={16} />
                  {isExporting ? 'Gerando…' : 'Compartilhar'}
                </button>
                <button
                  className="btn btn-secondary recap-btn-dl"
                  onClick={handleDownload}
                  disabled={isExporting || isConvertingPhoto}
                >
                  <Download size={15} />
                  Baixar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </LayerPortal>
  );
}
