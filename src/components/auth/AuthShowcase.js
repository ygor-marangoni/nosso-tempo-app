'use client';

import { useEffect, useState } from 'react';
import { BookHeart, Camera, Clock, Heart, MapPin, Sparkles } from 'lucide-react';

const slides = [
  {
    icon: <Camera size={21} />,
    title: 'Álbum compartilhado',
    desc: 'Um espaço privado para guardar fotos e lembranças dos momentos mais especiais de vocês dois.',
  },
  {
    icon: <Clock size={21} />,
    title: 'Linha do tempo',
    desc: 'Acompanhem a história de vocês desde o primeiro dia, organizada cronologicamente.',
  },
  {
    icon: <BookHeart size={21} />,
    title: 'Diário do casal',
    desc: 'Registrem aventuras, sentimentos e histórias que marcaram o relacionamento de vocês.',
  },
  {
    icon: <MapPin size={21} />,
    title: 'Marcos importantes',
    desc: 'Celebrem aniversários, conquistas e todas as datas que têm significado para vocês.',
  },
  {
    icon: <Sparkles size={21} />,
    title: 'Relatórios & estatísticas',
    desc: 'Veja quantos momentos vocês já viveram juntos e acompanhem o crescimento da história de vocês.',
  },
];

export default function AuthShowcase() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="auth-showcase-panel">
      <div className="auth-showcase-inner">
        <div className="auth-showcase-badge">
          <span className="auth-showcase-badge-icon">
            <Heart size={13} fill="currentColor" strokeWidth={0} />
          </span>
          O espaço privado de vocês
        </div>

        <h2 className="auth-showcase-headline">
          Guardem cada<br />momento juntos
        </h2>

        <p className="auth-showcase-desc">
          Um diário digital privado e exclusivo para registrar a história que só vocês dois conhecem.
        </p>

        <div className="auth-carousel">
          <div
            className="auth-carousel-track"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((slide, i) => (
              <div className="auth-carousel-slide" key={i} aria-hidden={i !== current}>
                <span className="auth-carousel-icon">{slide.icon}</span>
                <div>
                  <strong>{slide.title}</strong>
                  <p>{slide.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-carousel-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`auth-carousel-dot${i === current ? ' active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
