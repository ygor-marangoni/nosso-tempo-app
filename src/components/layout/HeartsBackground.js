'use client';

import { memo } from 'react';

const HEARTS = [
  { left:'8%',  top:'10%', size:12, opacity:.13, anim:'hf1', dur:'34s', delay:'0s'   },
  { left:'20%', top:'58%', size: 8, opacity:.12, anim:'hf2', dur:'42s', delay:'-12s' },
  { left:'34%', top:'22%', size:18, opacity:.10, anim:'hf3', dur:'50s', delay:'-6s'  },
  { left:'25%', top:'82%', size:10, opacity:.13, anim:'hf1', dur:'30s', delay:'-20s' },
  { left:'46%', top:'14%', size:16, opacity:.11, anim:'hf2', dur:'40s', delay:'-9s'  },
  { left:'53%', top:'68%', size:10, opacity:.14, anim:'hf3', dur:'44s', delay:'-24s' },
  { left:'38%', top:'44%', size: 8, opacity:.11, anim:'hf1', dur:'38s', delay:'-4s'  },
  { left:'66%', top:'30%', size:14, opacity:.12, anim:'hf2', dur:'46s', delay:'-16s' },
  { left:'73%', top:'75%', size:12, opacity:.11, anim:'hf3', dur:'28s', delay:'-8s'  },
  { left:'81%', top:'12%', size:20, opacity:.10, anim:'hf1', dur:'52s', delay:'-22s' },
  { left:'87%', top:'88%', size: 8, opacity:.13, anim:'hf2', dur:'36s', delay:'-14s' },
  { left:'93%', top:'50%', size:16, opacity:.11, anim:'hf3', dur:'42s', delay:'-28s' },
  { left:'59%', top:'92%', size:10, opacity:.14, anim:'hf1', dur:'34s', delay:'-5s'  },
  { left:'48%', top:'48%', size:12, opacity:.11, anim:'hf2', dur:'48s', delay:'-18s' },
  { left:'15%', top:'35%', size: 8, opacity:.13, anim:'hf3', dur:'40s', delay:'-10s' },
  { left:'3%',  top:'65%', size:14, opacity:.10, anim:'hf2', dur:'45s', delay:'-7s'  },
  { left:'11%', top:'88%', size:10, opacity:.12, anim:'hf3', dur:'32s', delay:'-17s' },
  { left:'29%', top:'5%',  size: 8, opacity:.11, anim:'hf1', dur:'44s', delay:'-3s'  },
  { left:'42%', top:'78%', size:16, opacity:.10, anim:'hf2', dur:'38s', delay:'-26s' },
];

function HeartsBackground() {
  return (
    <div className="hearts-bg" aria-hidden="true">
      {HEARTS.map((h, i) => (
        <div
          key={i}
          className="hrt"
          style={{
            left: h.left, top: h.top,
            width: h.size, height: h.size,
            opacity: h.opacity,
            animation: `${h.anim} ${h.dur} ease-in-out infinite ${h.delay}`,
          }}
        />
      ))}
    </div>
  );
}

export default memo(HeartsBackground);
