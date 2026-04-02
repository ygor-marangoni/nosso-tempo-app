import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          background: '#fffbfc',
          color: '#3d2233',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top right, rgba(239,80,135,0.08), transparent 38%), radial-gradient(circle at bottom left, rgba(255,160,184,0.08), transparent 32%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '999px',
              background: '#ef5087',
            }}
          />
          <div style={{ fontSize: '28px', color: '#d63a6e', fontWeight: 700 }}>Nosso Tempo</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', zIndex: 1 }}>
          <div style={{ fontSize: '88px', lineHeight: 0.92, color: '#d63a6e', fontWeight: 700 }}>
            Memórias do casal,
            <br />
            no mesmo espaço.
          </div>
          <div style={{ fontSize: '30px', lineHeight: 1.5, color: '#7a5468', maxWidth: '860px' }}>
            Registrem momentos, fotos, marcos e relatórios em um app privado, delicado e compartilhado a dois.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', zIndex: 1 }}>
          {['Álbum', 'Histórico', 'Linha do Tempo', 'Relatórios'].map(item => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                borderRadius: '999px',
                background: '#ffffff',
                border: '1px solid #f2dae2',
                color: '#7a5468',
                fontSize: '22px',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
