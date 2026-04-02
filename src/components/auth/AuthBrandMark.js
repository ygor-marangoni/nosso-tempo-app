'use client';

import { useEffect, useState } from 'react';

const couples = [
  'YGOR & JULIANNE',
  'ANA & PEDRO',
  'LUCAS & MARINA',
  'RAFAEL & ISABELA',
  'JOÃO & CAMILA',
];

const TYPING_SPEED = 80;
const DELETING_SPEED = 45;
const PAUSE_AFTER_TYPE = 1800;
const PAUSE_AFTER_DELETE = 300;

export default function AuthBrandMark() {
  const [displayText, setDisplayText] = useState('');
  const [nameIndex, setNameIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = couples[nameIndex];

    if (!isDeleting && displayText === current) {
      const pause = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPE);
      return () => clearTimeout(pause);
    }

    if (isDeleting && displayText === '') {
      const pause = setTimeout(() => {
        setIsDeleting(false);
        setNameIndex(prev => (prev + 1) % couples.length);
      }, PAUSE_AFTER_DELETE);
      return () => clearTimeout(pause);
    }

    const timeout = setTimeout(() => {
      setDisplayText(isDeleting
        ? current.slice(0, displayText.length - 1)
        : current.slice(0, displayText.length + 1)
      );
    }, isDeleting ? DELETING_SPEED : TYPING_SPEED);

    return () => clearTimeout(timeout);
  }, [displayText, nameIndex, isDeleting]);

  return (
    <div className="auth-brand-header">
      <p className="auth-brand-title">Nosso Tempo</p>
      <span className="auth-brand-names">
        {displayText}
        <span className="auth-brand-cursor">|</span>
      </span>
    </div>
  );
}
