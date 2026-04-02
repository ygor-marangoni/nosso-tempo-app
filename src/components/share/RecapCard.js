'use client';

/**
 * RecapCard - Template visual do recap mensal.
 *
 * Preview: 270x480px
 * Exportado com pixelRatio alto no html-to-image.
 */

const W = 270;
const H = 480;
const PHOTO_H = 232;
const CONTENT_H = H - PHOTO_H;

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max - 1)}...` : str;
}

function normalizeQuotedPhrase(str = '') {
  return str
    .trim()
    .replace(/^[“"'`\u2018\u2019\u201C\u201D\s]+/, '')
    .replace(/[“"'`\u2018\u2019\u201C\u201D]+(?=[.!?…,:;) \]]*$)/g, '')
    .replace(/[“"'`\u2018\u2019\u201C\u201D\s]+$/, '')
    .trim();
}

export default function RecapCard({
  recap,
  showNames = true,
  showPhrase = true,
  photoDataUri = null,
  cardRef,
}) {
  const {
    monthName = '',
    year = new Date().getFullYear(),
    totalHoursFormatted = '0h',
    momentCount = 0,
    phrase = null,
    hasData = false,
    name1 = '',
    name2 = '',
  } = recap || {};

  const displayNames = showNames
    ? [name1, name2].filter(Boolean).join(' & ')
    : [name1?.[0], name2?.[0]].filter(Boolean).join(' & ');

  const hasPhoto = Boolean(photoDataUri);
  const phraseText = truncate(normalizeQuotedPhrase(phrase), 120);
  const hasVisiblePhrase = Boolean(showPhrase && phraseText);

  const cursiveFont = 'var(--font-cursive), "Covered By Your Grace", cursive';
  const sansFont = 'var(--font-figtree), "Figtree", sans-serif';

  const s = {
    root: {
      width: W,
      height: H,
      background: 'var(--card)',
      fontFamily: sansFont,
      color: 'var(--text)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    },

    photoWrap: {
      width: '100%',
      height: PHOTO_H,
      position: 'relative',
      flexShrink: 0,
      overflow: 'hidden',
    },

    photoImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    },

    heroGrad: {
      width: '100%',
      height: '100%',
      background:
        'linear-gradient(160deg, var(--rosa-100) 0%, var(--rosa-200) 60%, var(--rosa-100) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '16px 20px',
    },

    heroNames: {
      fontFamily: cursiveFont,
      fontSize: 34,
      color: 'var(--rosa-700)',
      lineHeight: 1.1,
      textAlign: 'center',
    },

    heroBrand: {
      fontSize: 9,
      letterSpacing: 3.5,
      textTransform: 'uppercase',
      color: 'var(--rosa-400)',
      fontWeight: 600,
      marginTop: 2,
    },

    photoFade: {
      position: 'absolute',
      bottom: -1,
      left: 0,
      right: 0,
      height: 64,
      background: 'linear-gradient(to bottom, transparent, var(--card))',
      pointerEvents: 'none',
    },

    content: {
      width: '100%',
      height: CONTENT_H + 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '18px 24px 14px',
      gap: 0,
      overflow: 'hidden',
      position: 'relative',
      marginTop: -1,
    },

    names: {
      fontFamily: cursiveFont,
      fontSize: 29,
      color: 'var(--rosa-600)',
      lineHeight: 1.1,
      textAlign: 'center',
      flexShrink: 0,
    },

    monthLabel: {
      fontSize: 9.5,
      color: 'var(--text-muted)',
      letterSpacing: 2.8,
      textTransform: 'uppercase',
      fontWeight: 600,
      textAlign: 'center',
      flexShrink: 0,
      marginTop: 10,
    },

    separator: {
      width: '48%',
      height: 1,
      background: 'var(--rosa-200)',
      flexShrink: 0,
      marginTop: 13,
      marginBottom: 13,
    },

    statsRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 22,
      flexShrink: 0,
    },

    statBlock: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
    },

    statNum: {
      fontFamily: cursiveFont,
      fontSize: 34,
      color: 'var(--rosa-700)',
      lineHeight: 1,
      textAlign: 'center',
    },

    statLabel: {
      fontSize: 8.5,
      color: 'var(--text-muted)',
      fontWeight: 600,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      textAlign: 'center',
    },

    statDivider: {
      width: 1,
      height: 36,
      background: 'var(--rosa-200)',
      flexShrink: 0,
    },

    emptyMsg: {
      fontSize: 11,
      color: 'var(--text-muted)',
      fontStyle: 'italic',
      textAlign: 'center',
      flexShrink: 0,
    },

    phraseWrap: {
      flex: 1,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 14px 0',
      overflow: 'visible',
    },

    phraseText: {
      display: 'inline-flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 0,
      maxWidth: '100%',
      fontSize: 12,
      color: 'var(--text-light)',
      fontStyle: 'italic',
      textAlign: 'center',
      lineHeight: 1.65,
      overflow: 'visible',
    },

    phraseQuote: {
      flexShrink: 0,
      lineHeight: 1,
      display: 'inline-block',
      transform: 'translateY(-0.5px)',
    },

    phraseQuoteOpen: {
      marginRight: 1,
    },

    phraseQuoteClose: {
      marginLeft: -1,
    },

    phraseTextBody: {
      minWidth: 0,
      display: 'inline-block',
    },

    noPhraseCenterWrap: {
      flex: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 18,
    },

    noPhraseStatsWrap: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    },

    watermark: {
      fontSize: 8.5,
      fontFamily: cursiveFont,
      color: 'var(--rosa-300)',
      letterSpacing: 1.5,
      textAlign: 'center',
      flexShrink: 0,
      paddingBottom: 2,
    },
  };

  return (
    <div ref={cardRef} style={s.root}>
      <div style={s.photoWrap}>
        {hasPhoto ? (
          <img src={photoDataUri} alt="" style={s.photoImg} />
        ) : (
          <div style={s.heroGrad}>
            {displayNames && <div style={s.heroNames}>{displayNames}</div>}
            <div style={s.heroBrand}>nosso tempo</div>
          </div>
        )}
        <div style={s.photoFade} />
      </div>

      <div style={s.content}>
        {hasVisiblePhrase ? (
          <>
            {hasPhoto && displayNames && (
              <div style={s.names}>{displayNames}</div>
            )}

            <div style={s.monthLabel}>em {monthName}, {year}</div>
            <div style={s.separator} />

            {hasData ? (
              <div style={s.statsRow}>
                <div style={s.statBlock}>
                  <div style={s.statNum}>{totalHoursFormatted}</div>
                  <div style={s.statLabel}>juntos</div>
                </div>
                <div style={s.statDivider} />
                <div style={s.statBlock}>
                  <div style={s.statNum}>{momentCount}</div>
                  <div style={s.statLabel}>{momentCount === 1 ? 'momento' : 'momentos'}</div>
                </div>
              </div>
            ) : (
              <div style={s.emptyMsg}>um mês novo juntos</div>
            )}
          </>
        ) : (
          <div style={s.noPhraseCenterWrap}>
            {hasPhoto && displayNames && (
              <div style={s.names}>{displayNames}</div>
            )}

            <div style={s.monthLabel}>em {monthName}, {year}</div>
            <div style={s.separator} />

            <div style={s.noPhraseStatsWrap}>
              {hasData ? (
                <div style={s.statsRow}>
                  <div style={s.statBlock}>
                    <div style={s.statNum}>{totalHoursFormatted}</div>
                    <div style={s.statLabel}>juntos</div>
                  </div>
                  <div style={s.statDivider} />
                  <div style={s.statBlock}>
                    <div style={s.statNum}>{momentCount}</div>
                    <div style={s.statLabel}>{momentCount === 1 ? 'momento' : 'momentos'}</div>
                  </div>
                </div>
              ) : (
                <div style={s.emptyMsg}>um mês novo juntos</div>
              )}
            </div>
          </div>
        )}

        {hasVisiblePhrase ? (
          <div style={s.phraseWrap}>
            <div style={s.phraseText}>
              <span style={{ ...s.phraseQuote, ...s.phraseQuoteOpen }}>“</span>
              <span style={s.phraseTextBody}>{phraseText}</span>
              <span style={{ ...s.phraseQuote, ...s.phraseQuoteClose }}>”</span>
            </div>
          </div>
        ) : null}

        <div style={s.watermark}>nosso tempo</div>
      </div>
    </div>
  );
}
