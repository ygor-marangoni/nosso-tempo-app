'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Heart, Pencil, Quote, Sparkles } from 'lucide-react';
import { useCoupleConfig, useCoupleMeta, useCouplePhrases } from '@/contexts/CoupleContext';
import { calcRelationshipTime, MONTHS_PT } from '@/lib/dateUtils';
import { inviteHref } from '@/lib/invite';

const ShareRecapModal = dynamic(
  () => import('@/components/share/ShareRecapModal'),
  { ssr: false }
);

const SUB_PHRASES = [
  'que bom ter vocês aqui',
  'mais um dia dessa história linda',
  'cada momento de vocês importa',
  'essa história fica mais bonita todo dia',
  'que dia lindo pra estar juntos',
];

function hashString(value = '') {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickStableItem(items, seed) {
  if (!items.length) return null;
  return items[hashString(seed) % items.length];
}

export default function HomePage() {
  const router = useRouter();
  const { couple } = useCoupleMeta();
  const { config } = useCoupleConfig();
  const { phrases, ensurePhrasesLoaded } = useCouplePhrases();
  const [time, setTime] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showRecap, setShowRecap] = useState(false);

  const { name1 = '', name2 = '', startDate, couplePhotoUrl, inviteCode } = config;
  const sinceLabel = startDate
    ? (() => {
        const d = new Date(`${startDate}T12:00:00`);
        return `desde ${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;
      })()
    : null;
  const stableSeed = `${couple?.id || inviteCode || 'nosso-tempo'}:${name1}:${name2}`;
  const subPhrase = useMemo(() => pickStableItem(SUB_PHRASES, stableSeed) || SUB_PHRASES[0], [stableSeed]);
  const randomPhrase = useMemo(() => {
    const phraseSeed = `${stableSeed}:${phrases.map(phrase => phrase.id).join('|')}`;
    return pickStableItem(phrases, phraseSeed);
  }, [phrases, stableSeed]);

  useEffect(() => {
    ensurePhrasesLoaded();
  }, [ensurePhrasesLoaded]);

  useEffect(() => {
    if (!startDate) {
      setTime(null);
      return;
    }

    setTime(calcRelationshipTime(startDate));

    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    const timer = setTimeout(() => setTime(calcRelationshipTime(startDate)), msToMidnight);
    return () => clearTimeout(timer);
  }, [startDate]);

  async function copyInvite() {
    const origin = window.location.origin;
    await navigator.clipboard.writeText(inviteHref(inviteCode, origin));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const showYears = time && time.years > 0;
  const showMonths = time && (time.years > 0 || time.months > 0);
  const awaitingPartner = Boolean(inviteCode && !couple?.partnerUid);

  return (
    <div className="home-wrap">
      <div className="home-identity">
        <div className="home-photo-wrap">
          {couplePhotoUrl ? (
            <>
              <div className="home-polaroid">
                <div className="home-photo-inner">
                  <img src={couplePhotoUrl} alt="Foto do casal" loading="eager" fetchPriority="high" decoding="async" />
                </div>
              </div>
              <div className="home-photo-heart">
                <Heart size={16} fill="var(--rosa-500)" stroke="var(--rosa-500)" />
              </div>
            </>
          ) : (
            <div className="home-photo-ph" onClick={() => router.push('/app/settings')}>
              <Heart size={22} color="var(--rosa-300)" />
              <span>Adicionar foto de vocês</span>
            </div>
          )}
        </div>

        <div className="home-greet">
          <span className="home-greet-names">
            {name1}
            <Heart
              className="home-greet-heart"
              size={20}
              fill="var(--rosa-500)"
              stroke="var(--rosa-500)"
              style={{ verticalAlign: 'middle', position: 'relative', top: -2 }}
            />
            {name2}
          </span>
        </div>
      </div>

      {startDate ? (
        <div className="home-counter-block">
          <div className="home-counter">
            {showYears && (
              <>
                <div className="cnt-unit">
                  <span className="cnt-num">{time.years}</span>
                  <span className="cnt-lbl">{time.years === 1 ? 'ano' : 'anos'}</span>
                </div>
                <div className="cnt-sep">
                  <Heart size={8} fill="currentColor" className="home-counter-legend" />
                </div>
              </>
            )}

            {showMonths && (
              <>
                <div className="cnt-unit">
                  <span className="cnt-num">{time.months}</span>
                  <span className="cnt-lbl">{time.months === 1 ? 'mês' : 'meses'}</span>
                </div>
                <div className="cnt-sep">
                  <Heart size={8} fill="currentColor" className="home-counter-legend" />
                </div>
              </>
            )}

            <div className="cnt-unit">
              <span className="cnt-num">{time?.days ?? 0}</span>
              <span className="cnt-lbl">{time?.days === 1 ? 'dia' : 'dias'}</span>
            </div>
          </div>
          <div className="home-counter-foot">{sinceLabel}</div>
        </div>
      ) : (
        <p className="home-no-date" onClick={() => router.push('/app/settings')}>
          Configure a data do relacionamento nos Ajustes
        </p>
      )}

      {randomPhrase && (
        <div className="home-quote">
          <Quote size={18} color="var(--rosa-200)" className="home-quote-icon" />
          <p>{randomPhrase.text}</p>
        </div>
      )}

      {awaitingPartner && (
        <div className="home-pending-invite">
          <div className="home-pending-title">Convite pronto para {name2}</div>
          <p>Compartilhe o link para conectar a outra conta ao mesmo espaço do casal.</p>
          <button className="home-secondary-btn" onClick={copyInvite}>
            <Copy size={14} />
            {copied ? 'Copiado' : 'Copiar Convite'}
          </button>
        </div>
      )}

      <div className="home-actions">
        <Link href="/app/register" className="home-register-btn">
          <Pencil size={15} />
          Registrar Momento
        </Link>
        <button className="recap-trigger-btn" onClick={() => setShowRecap(true)}>
          <Sparkles size={13} />
          Recap do Mês
        </button>
      </div>

      {showRecap && <ShareRecapModal onClose={() => setShowRecap(false)} />}
    </div>
  );
}
