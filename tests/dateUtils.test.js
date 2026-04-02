import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calcRelationshipTime,
  formatDatePt,
  formatDateShortPt,
  formatTime,
  relativeTime,
  timeBetween,
} from '../src/lib/dateUtils.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('dateUtils', () => {
  it('formata horas e minutos corretamente', () => {
    expect(formatTime(2.5)).toBe('2h 30min');
    expect(formatTime(3)).toBe('3h');
  });

  it('calcula tempo relativo em dias, meses e anos', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T12:00:00'));

    expect(relativeTime('2026-04-01')).toBe('hoje');
    expect(relativeTime('2026-03-31')).toBe('há 1 dia');
    expect(relativeTime('2026-03-01')).toBe('há 1 mês');
    expect(relativeTime('2024-04-01')).toBe('há 1 ano e 11 meses');
  });

  it('calcula intervalo entre duas datas', () => {
    expect(timeBetween('2026-03-31', '2026-04-01')).toBe('1 dia depois');
    expect(timeBetween('2026-01-01', '2026-04-01')).toBe('2 meses depois');
  });

  it('calcula o tempo do relacionamento', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T12:00:00'));

    expect(calcRelationshipTime('2024-01-15')).toEqual({
      years: 2,
      months: 2,
      days: 17,
    });
  });

  it('formata datas em português', () => {
    expect(formatDatePt('2026-04-01')).toBe('1 de abril, 2026');
    expect(formatDateShortPt('2026-04-01')).toBe('01/04/2026');
  });
});
