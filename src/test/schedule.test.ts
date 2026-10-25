import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPeak, nextBoundary, nextStatusChange, formatStatusTooltip } from '../schedule';

const noHoliday = () => false;
const at = (time: string) => new Date(time);

test('UTC window boundaries are start-inclusive, end-exclusive', () => {
  for (const [time, expected] of [
    ['2026-10-26T00:59:59Z', false],
    ['2026-10-26T01:00:00Z', true],
    ['2026-10-26T03:59:59Z', true],
    ['2026-10-26T04:00:00Z', false],
    ['2026-10-26T06:00:00Z', true],
    ['2026-10-26T09:59:59Z', true],
    ['2026-10-26T10:00:00Z', false]
  ] as const) assert.equal(isPeak(at(time), noHoliday), expected, time);
});

test('weekends are off-peak, including official make-up work weekends', () => {
  assert.equal(isPeak(at('2026-10-24T07:00:00Z'), noHoliday), false);
  assert.equal(isPeak(at('2026-10-25T02:00:00Z'), noHoliday), false);
});

test('holiday takes precedence over weekday windows', () => {
  assert.equal(isPeak(at('2026-10-26T02:00:00Z'), () => true), false);
  assert.equal(isPeak(at('2026-10-26T02:00:00Z'), noHoliday), true);
});

test('published Chinese New Year and National Day holidays are off-peak', () => {
  assert.equal(isPeak(at('2026-02-17T02:00:00Z')), false);
  assert.equal(isPeak(at('2026-10-01T07:00:00Z')), false);
});

test('nextBoundary handles UTC year rollover', () => {
  assert.equal(nextBoundary(at('2026-10-26T00:59:59Z')).toISOString(), '2026-10-26T01:00:00.000Z');
  assert.equal(nextBoundary(at('2026-10-26T01:00:00Z')).toISOString(), '2026-10-26T04:00:00.000Z');
  assert.equal(nextBoundary(at('2026-12-31T23:59:59Z')).toISOString(), '2027-01-01T00:00:00.000Z');
});

test('next actual transition skips unchanged intermediate boundaries', () => {
  assert.equal(nextStatusChange(at('2026-10-26T02:00:00Z'), noHoliday).toISOString(), '2026-10-26T04:00:00.000Z');
  assert.equal(nextStatusChange(at('2026-10-26T04:00:00Z'), noHoliday).toISOString(), '2026-10-26T06:00:00.000Z');
  assert.equal(nextStatusChange(at('2026-10-23T10:00:00Z'), noHoliday).toISOString(), '2026-10-26T01:00:00.000Z');
});

test('next actual transition skips an excluded public holiday', () => {
  const mondayHoliday = (date: Date) => date.toISOString().slice(0, 10) === '2026-10-26';
  assert.equal(nextStatusChange(at('2026-10-25T12:00:00Z'), mondayHoliday).toISOString(), '2026-10-27T01:00:00.000Z');
});

test('tooltip formats local time, today, tomorrow and a later date', () => {
  // Run under TZ=UTC in CI for deterministic local date expectations.
  const now = at('2026-10-26T02:00:00Z');
  assert.equal(formatStatusTooltip(now, at('2026-10-26T04:00:00Z'), true), 'PEAK until 04:00');
  assert.equal(formatStatusTooltip(now, at('2026-10-27T01:00:00Z'), false), 'OFF-PEAK until tomorrow at 01:00');
  assert.equal(formatStatusTooltip(now, at('2026-10-29T01:00:00Z'), false), 'OFF-PEAK until Thu, Oct 29 at 01:00');
});
