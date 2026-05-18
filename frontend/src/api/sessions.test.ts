import { describe, expect, it } from 'vitest';
import { formatGap, formatLapTime } from './sessions';

describe('formatLapTime', () => {
  it('formats minutes:seconds.millis', () => {
    expect(formatLapTime(83456)).toBe('1:23.456');
  });

  it('formats sub-minute as plain seconds', () => {
    expect(formatLapTime(28123)).toBe('28.123');
  });

  it('handles null/undefined gracefully', () => {
    expect(formatLapTime(null)).toBe('—');
    expect(formatLapTime(undefined)).toBe('—');
  });

  it('pads seconds correctly when single digit', () => {
    expect(formatLapTime(63456)).toBe('1:03.456');
  });
});

describe('formatGap', () => {
  it('formats positive gap with +', () => {
    expect(formatGap(1234)).toBe('+1.234');
  });

  it('formats negative gap with -', () => {
    expect(formatGap(-1234)).toBe('-1.234');
  });

  it('formats zero explicitly', () => {
    expect(formatGap(0)).toBe('+0.000');
  });

  it('returns dash for null', () => {
    expect(formatGap(null)).toBe('—');
  });
});
