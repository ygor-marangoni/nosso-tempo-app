'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  Copy,
  Heart,
  Link as LinkIcon,
  Palette,
  PlusCircle,
  User,
  X,
} from 'lucide-react';
import AuthBrandMark from '@/components/auth/AuthBrandMark';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import DatePicker from '@/components/onboarding/DatePicker';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleMeta } from '@/contexts/CoupleContext';
import { ensureUserAccount } from '@/lib/account';
import { buildCloudinaryDeliveryUrls, uploadCloudinaryImage } from '@/lib/cloudinary';
import { db } from '@/lib/firebase';
import { resizeImage } from '@/lib/imageUtils';
import { createInvite, inviteHref } from '@/lib/invite';
import {
  clearAuthFlow,
  clearPendingCoupleSyncId,
  clearPendingInviteCode,
  getAuthFlow,
  getPendingInviteCode,
  normalizeInviteCode,
  setAuthFlow,
  setPendingCoupleSyncId,
  setPendingInviteCode,
} from '@/lib/session';
import { PALETTE_OPTIONS } from '@/lib/tagConfig';
import { getPreferredUserName } from '@/lib/userName';

const TOTAL_STEPS = 5;


const STEP_ICONS = [
  <User key="name" size={24} strokeWidth={1.6} />,
  <Heart key="partner" size={24} strokeWidth={1.6} />,
  <Calendar key="date" size={24} strokeWidth={1.6} />,
  <Palette key="palette" size={24} strokeWidth={1.6} />,
  <Camera key="photo" size={24} strokeWidth={1.6} />,
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { coupleId, coupleLoading } = useCoupleMeta();

  const [mode, setMode] = useState('');
  const [step, setStep] = useState(1);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [startDate, setStartDate] = useState('');
  const [palette, setPalette] = useState('rosa');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');
  const [createdCoupleId, setCreatedCoupleId] = useState('');
  const createdCoupleIdRef = useRef('');
  const isCreatingSpaceFlowRef = useRef(false);
  const showingFinishStep = Boolean((createdCoupleId || createdCoupleIdRef.current) && step === 6);

  useEffect(() => {
    if (authLoading || coupleLoading) return;

    if (!user) {
      router.replace('/');
      return;
    }

    if (coupleId) {
      const activeCreatedCoupleId = createdCoupleId || createdCoupleIdRef.current;

      if (isCreatingSpaceFlowRef.current || (activeCreatedCoupleId && coupleId === activeCreatedCoupleId)) {
        clearAuthFlow();
        clearPendingInviteCode();
        return;
      }

      clearAuthFlow();
      clearPendingCoupleSyncId();
      clearPendingInviteCode();
      router.replace('/app/home');
      return;
    }

    const pendingInvite = getPendingInviteCode();
    if (pendingInvite) {
      router.replace(`/invite/${pendingInvite}`);
      return;
    }

    const flow = getAuthFlow();
    setMode(flow === 'create' ? 'create' : 'choice');
    setName1(current => current || getPreferredUserName(user, 'Você'));
  }, [authLoading, coupleId, coupleLoading, createdCoupleId, router, user]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    document.documentElement.dataset.palette = palette;
    return () => {
      document.documentElement.dataset.palette = 'rosa';
    };
  }, [palette]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const inviteLink = useMemo(() => inviteHref(inviteCode, origin), [inviteCode, origin]);
  const finishName1 = name1.trim();
  const finishName2 = name2.trim();

  const canAdvance = {
    1: name1.trim().length > 0,
    2: name2.trim().length > 0,
    3: true,
    4: true,
    5: true,
  };

  async function handlePhotoSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const { dataUrl } = await resizeImage(file, 420);
    setPhotoFile(file);
    setPhotoPreview(dataUrl);
  }

  function beginCreateFlow() {
    setAuthFlow('create');
    setMode('create');
    setStep(1);
    setError('');
  }

  function continueWithInvite() {
    const normalized = normalizeInviteCode(inviteInput);
    if (!normalized) {
      setError('Digite um código de convite válido.');
      return;
    }

    setPendingInviteCode(normalized);
    setAuthFlow('join');
    router.push(`/invite/${normalized}`);
  }

  async function finishCreateFlow() {
    if (!user) return;

    setSaving(true);
    setError('');
    isCreatingSpaceFlowRef.current = true;

    try {
      const coupleRef = doc(collection(db, 'couples'));
      const nextCoupleId = coupleRef.id;
      let couplePhotoUrl = null;
      let couplePhotoPath = null;
      let couplePhotoWidth = null;
      let couplePhotoHeight = null;

      if (photoFile) {
        const asset = await resizeImage(photoFile, 840);
        const uploaded = await uploadCloudinaryImage(asset.blob, {
          context: {
            app: 'nosso-tempo',
            coupleId: nextCoupleId,
          },
          publicId: `couples/${nextCoupleId}/photo/profile`,
          tags: ['nosso-tempo'],
        });
        const delivery = buildCloudinaryDeliveryUrls(uploaded.secure_url);
        couplePhotoPath = uploaded.public_id;
        couplePhotoUrl = delivery.url;
        couplePhotoWidth = uploaded.width;
        couplePhotoHeight = uploaded.height;
      }

      const ownerName = name1.trim();
      const partnerName = name2.trim();
      const generatedInviteCode = await createInvite(nextCoupleId, user.uid, partnerName);
      const batch = writeBatch(db);

      batch.set(coupleRef, {
        createdAt: serverTimestamp(),
        ownerUid: user.uid,
        partnerUid: null,
        updatedAt: serverTimestamp(),
      });

      batch.set(doc(db, 'couples', nextCoupleId, 'config', nextCoupleId), {
        couplePhotoHeight,
        couplePhotoPath,
        couplePhotoUrl,
        couplePhotoWidth,
        createdAt: serverTimestamp(),
        customTags: [],
        inviteCode: generatedInviteCode,
        name1: ownerName,
        name2: partnerName,
        palette,
        startDate,
        updatedAt: serverTimestamp(),
      });

      batch.set(doc(db, 'couples', nextCoupleId, 'members', user.uid), {
        email: user.email || '',
        joinedAt: serverTimestamp(),
        name: ownerName,
        role: 'owner',
        uid: user.uid,
        updatedAt: serverTimestamp(),
      });

      batch.set(
        doc(db, 'users', user.uid),
        {
          coupleId: nextCoupleId,
          email: user.email || '',
          joinedAt: serverTimestamp(),
          name: ownerName,
          role: 'owner',
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await batch.commit();
      createdCoupleIdRef.current = nextCoupleId;
      setCreatedCoupleId(nextCoupleId);
      setInviteCode(generatedInviteCode);
      setStep(6);
      clearAuthFlow();
      clearPendingInviteCode();
      void ensureUserAccount(user, { coupleId: nextCoupleId, name: ownerName, role: 'owner' }).catch(() => {});
    } catch (creationError) {
      isCreatingSpaceFlowRef.current = false;
      console.error(creationError);
      setError('Não foi possível criar o espaço de vocês agora.');
    } finally {
      setSaving(false);
    }
  }

  async function copyInviteLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function accessCreatedSpace() {
    isCreatingSpaceFlowRef.current = false;
    if (createdCoupleId) {
      setPendingCoupleSyncId(createdCoupleId);
    }

    router.replace('/app/home');
  }

  if (!mode) {
    return null;
  }

  if (mode === 'choice') {
    return (
      <div className="ob-choice-wrap">
        <div className="ob-choice-brand">
          <AuthBrandMark />
          <h1 className="ob-choice-title">Bem-vindo(a)!</h1>
          <p className="ob-choice-sub">Como você quer começar?</p>
        </div>

        <div className="choice-grid">
          <button className="choice-card choice-card--primary" onClick={beginCreateFlow}>
            <div className="choice-card-icon choice-card-icon--primary">
              <PlusCircle size={22} />
            </div>
            <div className="choice-card-title">Criar Novo Espaço</div>
            <div className="choice-card-desc">
              Personalize o tema, adicione os nomes do casal e gere o convite para o seu amor.
            </div>
            <div className="btn btn-primary choice-card-cta">
              <Heart size={14} fill="#fff" stroke="#fff" />
              Começar Agora
            </div>
          </button>

          <div className="choice-card choice-card-static">
            <div className="choice-card-icon">
              <LinkIcon size={22} />
            </div>
            <div className="choice-card-title">Tenho um Código de Convite</div>
            <div className="choice-card-desc">
              Cole o código abaixo para entrar no espaço já criado pelo seu parceiro(a).
            </div>
            <div className="choice-code-row">
              <input
                className="ob-input"
                onChange={event => setInviteInput(event.target.value)}
                placeholder="Ex: AB12CD34"
                type="text"
                value={inviteInput}
              />
              <button className="btn btn-primary choice-code-btn" onClick={continueWithInvite}>
                Entrar
              </button>
            </div>
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}
      </div>
    );
  }

  if (step === 6) {
    return (
      <div className="ob-full">
        <div className="ob-body">
          <div className="ob-body-inner ob-body-inner-finish">
            <div className="ob-finish-wrap">
              <div className="ob-finish-hero">
                <h2 className="ob-finish-title">Espaço de vocês criado!</h2>
                <p className="ob-finish-sub">Convide seu amor para entrar com você.</p>
              </div>

              <div className="ob-finish-couple">
                <span className="ob-finish-name">{finishName1}</span>
                <Heart
                  className="ob-finish-heart"
                  size={20}
                  fill="var(--rosa-500)"
                  stroke="var(--rosa-500)"
                  style={{ verticalAlign: 'middle', position: 'relative', top: -2 }}
                />
                <span className="ob-finish-name">{finishName2}</span>
              </div>

              <div className="ob-finish-invite-card">
                <p className="ob-finish-invite-label">Código de convite</p>
                <div className="ob-finish-code-display">{inviteCode}</div>
                <button className="btn btn-secondary ob-finish-share-btn" onClick={copyInviteLink}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Link copiado!' : 'Copiar link de convite'}
                </button>
                <p className="ob-finish-invite-hint">
                  Compartilhe o link com seu(sua) parceiro(a) para entrar no espaço de vocês.
                </p>
              </div>

              <button className="btn btn-primary ob-finish-primary" onClick={accessCreatedSpace}>
                Acessar Nosso Espaço
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ob-full">
      <div className="ob-header">
        <span className="ob-header-brand">Nosso Tempo</span>
        <div className="ob-progress-track">
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <div
              key={index}
              className={`ob-progress-seg${step > index + 1 ? ' done' : step === index + 1 ? ' active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="ob-body">
        <div className="ob-body-inner">
          <div className="ob-step-icon-wrap">
            {STEP_ICONS[Math.min(step, TOTAL_STEPS) - 1]}
          </div>

          {step === 1 && (
            <div className="ob-step-content">
              <h2 className="ob-step-title">Como você quer aparecer no app?</h2>
              <input
                autoFocus
                className="ob-input"
                onChange={event => setName1(event.target.value)}
                placeholder="Seu nome"
                type="text"
                value={name1}
              />
            </div>
          )}

          {step === 2 && (
            <div className="ob-step-content">
              <h2 className="ob-step-title">E o nome do seu amor?</h2>
              <input
                autoFocus
                className="ob-input"
                onChange={event => setName2(event.target.value)}
                placeholder="Nome do parceiro(a)"
                type="text"
                value={name2}
              />
            </div>
          )}

          {step === 3 && (
            <div className="ob-step-content">
              <h2 className="ob-step-title">Quando a história de vocês começou?</h2>
              <DatePicker onChange={setStartDate} value={startDate} />
            </div>
          )}

          {step === 4 && (
            <div className="ob-step-content">
              <h2 className="ob-step-title">Escolha o tema do espaço de vocês</h2>
              <div className="ob-palettes">
                {PALETTE_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    className={`ob-palette${palette === option.id ? ' selected' : ''}`}
                    onClick={() => setPalette(option.id)}
                  >
                    <div className="ob-palette-swatches">
                      {option.swatches.map(color => (
                        <span key={color} style={{ background: color }} />
                      ))}
                    </div>
                    <span className="ob-palette-name">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="ob-step-content">
              <h2 className="ob-step-title">Quer adicionar uma foto de vocês?</h2>
              <div className="ob-photo-area">
                {photoPreview ? (
                  <div className="ob-photo-preview-wrap">
                    <img alt="Prévia do casal" className="ob-photo-preview" src={photoPreview} />
                    <button
                      className="ob-photo-remove"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview('');
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="ob-photo-placeholder">
                    <Camera color="var(--rosa-300)" size={30} />
                    <span>Clique para selecionar uma foto</span>
                    <input accept="image/*" hidden onChange={handlePhotoSelect} type="file" />
                  </label>
                )}
              </div>
            </div>
          )}

          {error && <p className="auth-error" style={{ marginTop: 16 }}>{error}</p>}
        </div>
      </div>

      <div className="ob-foot">
        <div className="ob-foot-left">
          {step > 1 ? (
            <button className="ob-btn-back" onClick={() => setStep(current => current - 1)}>
              <ChevronLeft size={16} />
              Voltar
            </button>
          ) : (
            <button className="ob-btn-back" onClick={() => setMode('choice')}>
              <ChevronLeft size={16} />
              Voltar
            </button>
          )}
        </div>

        {step < 5 ? (
          <button
            className="ob-btn-next"
            disabled={!canAdvance[step]}
            onClick={() => setStep(current => current + 1)}
          >
            Próxima Etapa
            <ArrowRight size={16} />
          </button>
        ) : (
          <button className="ob-btn-next" disabled={saving} onClick={finishCreateFlow}>
            {saving ? 'Criando Espaço...' : 'Criar Nosso Espaço'}
            <Heart size={15} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  );
}
