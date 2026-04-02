import { describe, expect, it } from 'vitest';
import { normalizeInviteCode } from '../src/lib/session.js';
import { getPreferredUserName } from '../src/lib/userName.js';

describe('session helpers', () => {
  it('normaliza códigos de convite', () => {
    expect(normalizeInviteCode(' demo2026 ')).toBe('DEMO2026');
    expect(normalizeInviteCode('ab-cd')).toBe('AB-CD');
  });
});

describe('user name helper', () => {
  it('prioriza displayName', () => {
    expect(getPreferredUserName({ displayName: 'Julianne', email: 'julianne@email.com' })).toBe('Julianne');
  });

  it('usa o prefixo do e-mail quando não há nome', () => {
    expect(getPreferredUserName({ email: 'ygor@email.com' })).toBe('ygor');
  });

  it('usa fallback quando não há dados do usuário', () => {
    expect(getPreferredUserName(null, 'Amor')).toBe('Amor');
  });
});
