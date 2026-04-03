'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Copy,
  Heart,
  KeyRound,
  LogOut,
  Mail,
  Palette,
  Plus,
  Quote,
  Settings,
  Tag,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCouple } from '@/contexts/CoupleContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import AppDatePicker from '@/components/common/AppDatePicker';
import LucideIcon from '@/components/common/LucideIcon';
import { auth } from '@/lib/firebase';
import { inviteHref } from '@/lib/invite';
import { clearAuthFlow, clearPendingInviteCode } from '@/lib/session';
import { ICON_OPTIONS, PALETTE_OPTIONS } from '@/lib/tagConfig';

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const iconPickerRef = useRef(null);
  const { refreshUser, sendVerificationEmail, signOut, user } = useAuth();
  const {
    couple,
    currentMember,
    partnerMember,
    userProfile,
    config,
    phrases,
    phrasesReady,
    addPhrase,
    removePhrase,
    addCustomTag,
    removeCustomTag,
    clearCoupleData,
    isOwner,
    isDemoMode,
    members,
    saveConfig,
    saveCoupleNames,
    saveCouplePhoto,
    removeCouplePhoto,
    ensurePhrasesLoaded,
  } = useCouple();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [newPhrase, setNewPhrase] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('sparkles');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    ensurePhrasesLoaded();
  }, [ensurePhrasesLoaded]);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const inviteLink = useMemo(() => inviteHref(config.inviteCode, origin), [config.inviteCode, origin]);
  const ownerConfiguredName = String(config.name1 || '').trim();
  const partnerConfiguredName = String(config.name2 || '').trim();
  const viewerRole = currentMember?.role || (isOwner ? 'owner' : 'partner');

  useEffect(() => {
    const selfName =
      viewerRole === 'partner'
        ? partnerConfiguredName || currentMember?.name || userProfile?.name || ''
        : ownerConfiguredName || currentMember?.name || userProfile?.name || '';
    const otherName =
      viewerRole === 'partner'
        ? ownerConfiguredName || partnerMember?.name || ''
        : partnerConfiguredName || partnerMember?.name || '';
    setMyName(selfName);
    setPartnerName(otherName);
    setStartDate(config.startDate || '');
  }, [
    config,
    currentMember?.name,
    partnerMember?.name,
    partnerConfiguredName,
    ownerConfiguredName,
    userProfile?.name,
    viewerRole,
  ]);

  async function handleSaveNames() {
    const normalizedSelfName = myName.trim();
    const normalizedPartnerName = partnerName.trim();

    if (!normalizedSelfName || !normalizedPartnerName) {
      showToast('Preencha os dois nomes.');
      return;
    }

    try {
      await saveCoupleNames(
        isOwner
          ? { name1: normalizedSelfName, name2: normalizedPartnerName }
          : { name1: normalizedPartnerName, name2: normalizedSelfName },
      );
      showToast('Nomes salvos.');
    } catch {
      showToast('Não foi possível salvar os nomes.');
    }
  }

  async function handleSaveStartDate() {
    try {
      await saveConfig({ startDate });
      showToast('Data salva.');
    } catch {
      showToast('Não foi possível salvar a data.');
    }
  }

  async function handleSelectPalette(paletteId) {
    try {
      await saveConfig({ palette: paletteId });
      showToast('Tema atualizado.');
    } catch {
      showToast('Não foi possível atualizar o tema.');
    }
  }

  async function handleCouplePhoto(file) {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      await saveCouplePhoto(file);
      showToast('Foto do casal salva.');
    } catch {
      showToast('Não foi possível salvar a foto.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleCopyInvite() {
    await navigator.clipboard.writeText(inviteLink || config.inviteCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleAddPhrase() {
    if (!newPhrase.trim()) return;
    try {
      await addPhrase(newPhrase.trim());
      setNewPhrase('');
      showToast('Frase adicionada.');
    } catch {
      showToast('Não foi possível adicionar a frase.');
    }
  }

  async function handleAddTag() {
    if (!newTag.trim()) return;
    try {
      await addCustomTag({ name: newTag.trim(), icon: selectedIcon });
      setNewTag('');
      setSelectedIcon('sparkles');
      setIconPickerOpen(false);
      showToast('Atividade personalizada adicionada.');
    } catch {
      showToast('Não foi possível adicionar a atividade.');
    }
  }

  async function handleRemoveTag(name) {
    try {
      await removeCustomTag(name);
      showToast('Atividade removida.');
    } catch {
      showToast('Não foi possível remover a atividade.');
    }
  }

  async function handleRemovePhrase(id) {
    try {
      await removePhrase(id);
      showToast('Frase removida.');
    } catch {
      showToast('Não foi possível remover a frase.');
    }
  }

  function handleClearData() {
    showConfirm('Tem certeza de que deseja limpar as memórias do casal?', async () => {
      try {
        await clearCoupleData();
        showToast('Memórias removidas.');
      } catch {
        showToast('Não foi possível limpar os dados.');
      }
    });
  }

  function handleRemovePhoto() {
    showConfirm('Deseja remover a foto do casal?', async () => {
      try {
        await removeCouplePhoto();
        showToast('Foto removida.');
      } catch {
        showToast('Não foi possível remover a foto.');
      }
    });
  }

  async function handleLogout() {
    clearAuthFlow();
    clearPendingInviteCode();
    await signOut();
    router.replace('/auth/login');
  }

  async function handleChangePassword() {
    if (user?.isDemo) {
      showToast('A conta de teste não usa senha real.');
      return;
    }

    if (!isEmailPasswordAccount) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Preencha a senha atual, a nova senha e a confirmação.');
      return;
    }

    if (newPassword.length < 6) {
      showToast('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('A confirmação da senha não confere.');
      return;
    }

    if (currentPassword === newPassword) {
      showToast('Escolha uma nova senha diferente da atual.');
      return;
    }

    const currentAuthUser = auth.currentUser;
    if (!currentAuthUser?.email) {
      showToast('Não foi possível validar sua conta agora.');
      return;
    }

    setChangingPassword(true);

    try {
      const credential = EmailAuthProvider.credential(currentAuthUser.email, currentPassword);
      await reauthenticateWithCredential(currentAuthUser, credential);
      await updatePassword(currentAuthUser, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Senha atualizada com sucesso.');
    } catch (error) {
      if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        showToast('A senha atual está incorreta.');
      } else if (error?.code === 'auth/weak-password') {
        showToast('Escolha uma senha mais forte.');
      } else if (error?.code === 'auth/too-many-requests') {
        showToast('Muitas tentativas. Aguarde um pouco e tente novamente.');
      } else {
        showToast('Não foi possível atualizar a senha.');
      }
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleSendVerificationEmail() {
    if (!needsEmailVerification) return;

    setSendingVerification(true);

    try {
      await sendVerificationEmail();
      showToast('E-mail de verificação enviado.');
    } catch {
      showToast('Não foi possível enviar o e-mail de verificação.');
    } finally {
      setSendingVerification(false);
    }
  }

  async function handleRefreshVerification() {
    if (!needsEmailVerification) return;

    setCheckingVerification(true);

    try {
      const refreshedUser = await refreshUser();
      if (refreshedUser?.emailVerified) {
        showToast('Seu e-mail foi confirmado com sucesso.');
      } else {
        showToast('Ainda não encontramos a confirmação do seu e-mail.');
      }
    } catch {
      showToast('Não foi possível atualizar o status da verificação.');
    } finally {
      setCheckingVerification(false);
    }
  }

  function getInitials(name) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'NT';
    return parts
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
  }

  function resolveDisplayedMemberName(member) {
    if (!member) return '';
    if (member.role === 'owner') return config.name1 || member.name || '';
    if (member.role === 'partner') return config.name2 || member.name || '';
    return member.name || '';
  }

  const resolvedPartnerName =
    currentMember?.role === 'partner'
      ? ownerConfiguredName || partnerName.trim() || String(partnerMember?.name || '').trim() || 'Parceiro(a)'
      : partnerConfiguredName || partnerName.trim() || String(partnerMember?.name || '').trim() || 'Parceiro(a)';
  const accountName =
    String(currentMember?.name || '').trim() ||
    String(userProfile?.name || '').trim() ||
    (viewerRole === 'partner' ? partnerConfiguredName : ownerConfiguredName) ||
    myName.trim() ||
    user?.displayName ||
    'Conta';
  const hasConnectedPartner = Boolean(couple?.partnerUid || partnerMember || members.length > 1);
  const providerId = user?.providerData?.[0]?.providerId || (user?.email ? 'password' : '');
  const isEmailPasswordAccount = providerId === 'password';
  const providerLabel = user?.isDemo
    ? 'Conta de teste local'
    : providerId === 'google.com'
      ? 'Google'
      : isEmailPasswordAccount
        ? 'Email e senha'
        : 'Acesso autenticado';
  const needsEmailVerification = Boolean(isEmailPasswordAccount && !user?.isDemo && !user?.emailVerified);

  function formatAuthDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  const createdAtLabel = user?.isDemo ? '14 de fev. de 2026, 20:26' : formatAuthDate(user?.metadata?.creationTime);

  return (
    <div>
      <div className="page-header">
        <h1>Ajustes</h1>
        <p>
          <Settings size={14} color="var(--rosa-400)" /> Personalize a experiência do casal
        </p>
      </div>

      {isDemoMode && (
        <div className="card config-section">
          <div className="card-title">
            <Heart size={14} /> Conta teste ativa
          </div>
          <p className="settings-note">
            Este modo salva tudo localmente no navegador, sem Firebase. Quando o banco real estiver pronto,
            basta sair e criar sua conta normal.
          </p>
        </div>
      )}

      <div className="card config-section">
        <div className="card-title">
          <Users size={14} /> Nomes do casal
        </div>
        <div className="couple-names-row">
          <div>
            <label>Seu nome</label>
            <input type="text" value={myName} onChange={event => setMyName(event.target.value)} />
          </div>
          <div className="couple-heart-icon">
            <Heart size={22} fill="var(--rosa-400)" stroke="var(--rosa-400)" />
          </div>
          <div>
            <label>Nome do parceiro(a)</label>
            <input type="text" value={partnerName} onChange={event => setPartnerName(event.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="btn btn-primary btn-sm" onClick={handleSaveNames}>
            <Check size={14} />
            Salvar
          </button>
        </div>
      </div>

      <div className="card config-section">
        <div className="card-title">
          <Tag size={14} /> Atividades personalizadas
        </div>
        <p className="settings-note">Essas atividades aparecem na tela de registro.</p>
        <div className="icon-picker-area" ref={iconPickerRef}>
          <div className="tag-input-row">
            <button className={`icon-picker-btn${iconPickerOpen ? ' active' : ''}`} type="button" onClick={() => setIconPickerOpen(open => !open)}>
              <LucideIcon name={selectedIcon} size={16} />
            </button>
            <input type="text" value={newTag} onChange={event => setNewTag(event.target.value)} placeholder="Nova atividade..." />
            <button className="btn btn-secondary btn-sm tag-add-btn" onClick={handleAddTag}>
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

        <div className="custom-tags-list">
          {(config.customTags || []).map(tag => (
            <span className="removable-tag" key={tag.name}>
              <LucideIcon name={tag.icon} size={12} />
              {tag.name}
              <button onClick={() => handleRemoveTag(tag.name)}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="card config-section">
        <div className="card-title">
          <Camera size={14} /> Foto do casal
        </div>
        <p className="settings-note">Ela aparece na tela inicial do app.</p>
        <div className="upload-area couple-photo-upload" onClick={() => fileInputRef.current?.click()}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={event => handleCouplePhoto(event.target.files?.[0])}
          />
          {config.couplePhotoUrl ? (
            <div className="upload-preview">
              <img src={config.couplePhotoUrl} alt="Foto do casal" decoding="async" />
              <button
                className="preview-remove"
                onClick={event => {
                  event.stopPropagation();
                  handleRemovePhoto();
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <Camera size={36} color="var(--rosa-300)" />
              <p>{uploadingPhoto ? 'Enviando foto...' : 'Clique para adicionar a foto de vocês'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card config-section">
        <div className="card-title">
          <Heart size={14} /> Data do relacionamento
        </div>
        <p className="settings-note">Quando a história de vocês começou?</p>
        <div className="form-grid">
          <div>
            <label>Data de início</label>
            <AppDatePicker value={startDate} onChange={setStartDate} />
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="btn btn-primary btn-sm" onClick={handleSaveStartDate}>
            <Check size={14} />
            Salvar
          </button>
        </div>
      </div>

      <div className="card config-section">
        <div className="card-title">
          <Quote size={14} /> Frases do casal
        </div>
        <p className="settings-note">Aparecem aleatoriamente na tela inicial.</p>
        <div className="tag-input-row">
          <input
            type="text"
            value={newPhrase}
            onChange={event => setNewPhrase(event.target.value)}
            placeholder="Adicionar uma frase especial..."
          />
          <button className="btn btn-secondary btn-sm tag-add-btn" onClick={handleAddPhrase}>
            <Plus size={14} />
            Adicionar
          </button>
        </div>
        <div className="custom-tags-list">
          {!phrasesReady ? (
            <span className="settings-note">Carregando frases...</span>
          ) : (
            phrases.map(phrase => (
              <span className="removable-tag" key={phrase.id}>
                <Quote size={12} />
                {phrase.text}
                <button onClick={() => handleRemovePhrase(phrase.id)}>
                  <X size={11} />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      <div className="card config-section">
        <div className="card-title">
          <Palette size={14} /> Tema
        </div>
        <p className="settings-note">A paleta escolhida se aplica a todo o espaço do casal.</p>
        <div className="theme-picker-grid">
          {PALETTE_OPTIONS.map(option => (
            <button
              key={option.id}
              className={`theme-palette-card${config.palette === option.id ? ' selected' : ''}`}
              onClick={() => handleSelectPalette(option.id)}
            >
              <div className="theme-palette-swatches">
                {option.swatches.map(color => (
                  <span key={color} style={{ background: color }}></span>
                ))}
              </div>
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card config-section">
        <div className="card-title">
          <Copy size={14} /> Convite do casal
        </div>
        <p className="settings-note">Use este link para conectar a conta do parceiro(a) ao mesmo espaço.</p>
        <div className="invite-panel">
          <div className="invite-panel-top">
            <button className="btn btn-primary btn-sm invite-panel-copy-btn" onClick={handleCopyInvite}>
              <Copy size={14} />
              {copied ? 'Copiado' : 'Copiar Convite'}
            </button>
            <div className="invite-panel-code">{config.inviteCode || '—'}</div>
          </div>
        </div>
      </div>

      <div className="card config-section">
        <div className="card-title">
          <Users size={14} /> Participantes
        </div>
        <p className="settings-note">
          {couple?.partnerUid ? 'Quem já está neste espaço compartilhado.' : 'Quem já está no espaço e quem ainda falta aceitar o convite.'}
        </p>
        <div className="members-list">
          {members.map(member => (
            <div className={`member-row${member.id === currentMember?.id ? ' current' : ''}`} key={member.id}>
              <div className="member-avatar">{getInitials(resolveDisplayedMemberName(member))}</div>
              <div className="member-main">
                <div className="member-head">
                  <strong>{resolveDisplayedMemberName(member)}</strong>
                  {member.id === currentMember?.id && <span className="member-you">Você</span>}
                </div>
                <span>No mesmo espaço</span>
              </div>
            </div>
          ))}
          {!hasConnectedPartner && (
            <div className="member-row pending">
              <div className="member-avatar pending">{getInitials(resolvedPartnerName)}</div>
              <div className="member-main">
                <div className="member-head">
                  <strong>{resolvedPartnerName}</strong>
                </div>
                <span>Convite pendente</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card config-section">
        <div className="card-title">
          <LogOut size={14} /> Conta
        </div>
        <p className="settings-note">Veja os dados do seu acesso e gerencie a segurança da conta.</p>

        <div className="account-panel">
          <div className="account-head">
            <div className="account-avatar">{getInitials(accountName)}</div>
            <div className="account-head-copy">
              <strong>{accountName}</strong>
              <span>{user?.email || 'Email indisponível'}</span>
            </div>
          </div>

          <div className="account-info-list">
            <div className="account-info-row">
              <div className="account-info-label">
                <Mail size={13} />
                Email
              </div>
              <div className="account-info-value">{user?.email || 'Email indisponível'}</div>
            </div>

            <div className="account-info-row">
              <div className="account-info-label">
                <UserRound size={13} />
                Nome exibido
              </div>
              <div className="account-info-value">{accountName}</div>
            </div>

            <div className="account-info-row">
              <div className="account-info-label">
                <KeyRound size={13} />
                Método de acesso
              </div>
              <div className="account-info-value">{providerLabel}</div>
            </div>

            <div className="account-info-row">
              <div className="account-info-label">
                <Settings size={13} />
                Conta criada em
              </div>
              <div className="account-info-value">{createdAtLabel}</div>
            </div>
          </div>

          {needsEmailVerification && (
            <div className="account-verify-box">
              <div className="account-verify-copy">
                <strong>Confirme seu e-mail</strong>
                <span>
                  Enviamos um link de verificação para {user?.email}. Depois de confirmar, atualize o status da conta.
                </span>
              </div>
              <div className="account-verify-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleSendVerificationEmail}
                  disabled={sendingVerification}
                >
                  <Mail size={14} />
                  {sendingVerification ? 'Enviando...' : 'Reenviar Verificação'}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleRefreshVerification}
                  disabled={checkingVerification}
                >
                  <Check size={14} />
                  {checkingVerification ? 'Atualizando...' : 'Já Verifiquei'}
                </button>
              </div>
            </div>
          )}

          {isEmailPasswordAccount && !user?.isDemo ? (
            <div className="account-password-section">
              <div className="account-password-title">Trocar senha</div>
              <div className="account-password-grid">
                <div>
                  <label>Senha atual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={event => setCurrentPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div>
                  <label>Nova senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={event => setNewPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="Mínimo de 6 caracteres"
                  />
                </div>

                <div>
                  <label>Confirmar nova senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <div className="account-password-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleChangePassword} disabled={changingPassword}>
                  <KeyRound size={14} />
                  {changingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </div>
            </div>
          ) : (
            <div className="account-provider-note">
              {user?.isDemo
                ? 'A conta de teste usa credenciais locais e não precisa de troca de senha.'
                : 'A senha dessa conta é gerenciada pelo provedor de acesso usado no login.'}
            </div>
          )}

          <div className="account-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              <LogOut size={14} />
              Sair Da Conta
            </button>
          </div>
        </div>
      </div>

      <div className="card config-section">
        <div className="card-title">
          <Trash2 size={14} /> Dados
        </div>
        <p className="settings-note">Essa ação remove memórias, fotos, marcos e frases do espaço de vocês.</p>
        <div className="settings-actions">
          <button className="btn btn-secondary btn-sm danger-btn" onClick={handleClearData}>
            <Trash2 size={14} />
            Limpar Memórias Do Casal
          </button>
        </div>
      </div>
    </div>
  );
}
