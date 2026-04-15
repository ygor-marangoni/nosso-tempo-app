'use client';

import { useEffect, useMemo, useState } from 'react';

const ART_PATHS = {
  account: '/passo-a-passo-1.svg',
  invite: '/passo-a-passo-2.svg',
  live: '/passo-a-passo-3.svg',
};

const RAW_SVG_CACHE = new Map();
const RAW_SVG_REQUESTS = new Map();

const COLOR_REPLACEMENTS = [
  ['#FDFDFD', 'var(--how-art-card)'],
  ['#FDFCFC', 'var(--how-art-card)'],
  ['#FFFFFF', 'var(--how-art-card)'],
  ['white', 'var(--how-art-card)'],
  ['#F4E5E5', 'var(--how-art-rose-050)'],
  ['#F7D9DA', 'var(--how-art-rose-100)'],
  ['#F7D1D1', 'var(--how-art-rose-100)'],
  ['#ECE4E4', 'var(--how-art-rose-100)'],
  ['#FBCBCF', 'var(--how-art-rose-200)'],
  ['#FBDCDB', 'var(--how-art-rose-200)'],
  ['#FBDBDA', 'var(--how-art-rose-200)'],
  ['#F5C6C8', 'var(--how-art-rose-200)'],
  ['#F5BEC0', 'var(--how-art-rose-200)'],
  ['#F5AAB9', 'var(--how-art-rose-300)'],
  ['#F17B87', 'var(--how-art-rose-500)'],
  ['#F17F90', 'var(--how-art-rose-500)'],
  ['#E86A7E', 'var(--how-art-rose-500)'],
  ['#D85C77', 'var(--how-art-rose-600)'],
  ['#D5506D', 'var(--how-art-rose-600)'],
  ['#C14B63', 'var(--how-art-rose-700)'],
  ['#AD2C50', 'var(--how-art-photo-accent-deep)'],
  ['#ED959E', 'var(--how-art-photo-accent-soft)'],
  ['#E47D8D', 'var(--how-art-photo-accent-mid)'],
  ['#FAEAE5', 'var(--how-art-photo-surface)'],
  ['#EDF5E7', 'var(--how-art-success-soft)'],
  ['#A3CE7E', 'var(--how-art-success)'],
  ['#D3D4D9', 'var(--how-art-line)'],
  ['#C9C7C7', 'var(--how-art-neutral)'],
  ['#A0A2A9', 'var(--how-art-neutral)'],
  ['#817E7F', 'var(--how-art-ink-soft)'],
  ['#312E2F', 'var(--how-art-ink)'],
  ['#F47D8D', 'var(--how-art-rose-500)'],
  ['#EA6D7E', 'var(--how-art-rose-600)'],
];

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function prepareSvgMarkup(markup, slug) {
  let nextMarkup = markup.trim();

  nextMarkup = nextMarkup
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/filter="url\(#.*?\)"/g, '')
    .replace(/<filter[\s\S]*?<\/filter>/g, '')
    .replace(/\swidth="[^"]*"/i, '')
    .replace(/\sheight="[^"]*"/i, '')
    .replace(
      /<svg\b/,
      `<svg class="lp-how-art-svg lp-how-art-svg--${slug}" preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true" role="presentation"`,
    );

  COLOR_REPLACEMENTS.forEach(([from, to]) => {
    nextMarkup = nextMarkup.replace(new RegExp(escapeForRegex(from), 'gi'), to);
  });

  return nextMarkup;
}

async function readSvg(path) {
  if (RAW_SVG_CACHE.has(path)) {
    return RAW_SVG_CACHE.get(path);
  }

  if (RAW_SVG_REQUESTS.has(path)) {
    return RAW_SVG_REQUESTS.get(path);
  }

  const request = fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Falha ao carregar SVG: ${path}`);
      }

      return response.text();
    })
    .then(markup => {
      RAW_SVG_CACHE.set(path, markup);
      RAW_SVG_REQUESTS.delete(path);
      return markup;
    })
    .catch(error => {
      RAW_SVG_REQUESTS.delete(path);
      throw error;
    });

  RAW_SVG_REQUESTS.set(path, request);
  return request;
}

export default function HowStepArtwork({ slug }) {
  const [rawSvg, setRawSvg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const path = ART_PATHS[slug];

    if (!path) {
      setRawSvg('');
      return () => {
        isMounted = false;
      };
    }

    const cached = RAW_SVG_CACHE.get(path);
    if (cached) {
      setRawSvg(cached);
      return () => {
        isMounted = false;
      };
    }

    setRawSvg('');

    readSvg(path)
      .then(markup => {
        if (isMounted) {
          setRawSvg(markup);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRawSvg('');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const svgMarkup = useMemo(() => {
    if (!rawSvg) return '';
    return prepareSvgMarkup(rawSvg, slug);
  }, [rawSvg, slug]);

  if (!svgMarkup) {
    return (
      <div className={`lp-how-art lp-how-art--${slug} is-loading`} aria-hidden="true">
        <div className="lp-how-art-frame lp-how-art-frame--loading">
          <span className="lp-how-art-placeholder" />
        </div>
      </div>
    );
  }

  return (
    <div className={`lp-how-art lp-how-art--${slug} is-ready`} aria-hidden="true">
      <div className="lp-how-art-frame" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
    </div>
  );
}
