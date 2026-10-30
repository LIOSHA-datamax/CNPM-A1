import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import {
  ALLOWED_TRANSITIONS,
  assertTransition,
  canTransition,
} from './order-state-machine';

const ALL = Object.keys(ALLOWED_TRANSITIONS) as OrderStatus[];

describe('Order State Machine (unit)', () => {
  const valid: [OrderStatus, OrderStatus][] = [
    ['PENDING', 'PAID'],
    ['PENDING', 'PAYMENT_FAILED'],
    ['PENDING', 'CANCELLED'],
    ['PAYMENT_FAILED', 'PENDING'],
    ['PAYMENT_FAILED', 'CANCELLED'],
    ['PAID', 'PREPARING'],
    ['PAID', 'CANCELLED'],
    ['PREPARING', 'READY'],
    ['READY', 'COMPLETED'],
  ];

  it.each(valid)('cho phép %s -> %s', (from, to) => {
    expect(() => assertTransition(from, to)).not.toThrow();
  });

  it('chặn MỌI chuyển trạng thái không nằm trong danh sách hợp lệ', () => {
    for (const from of ALL) {
      for (const to of ALL) {
        const isValid = valid.some(([f, t]) => f === from && t === to);
        expect(canTransition(from, to)).toBe(isValid);
        if (!isValid) {
          expect(() => assertTransition(from, to)).toThrow(BadRequestException);
        }
      }
    }
  });

  it.each([
    ['COMPLETED', 'PAID'],
    ['PENDING', 'READY'],
    ['PENDING', 'COMPLETED'],
    ['PAID', 'PENDING'],
    ['PREPARING', 'PAID'],
  ] as [OrderStatus, OrderStatus][])('chặn %s -> %s', (from, to) => {
    expect(() => assertTransition(from, to)).toThrow(BadRequestException);
  });

  it('COMPLETED và CANCELLED là trạng thái kết thúc', () => {
    expect(ALLOWED_TRANSITIONS.COMPLETED).toEqual([]);
    expect(ALLOWED_TRANSITIONS.CANCELLED).toEqual([]);
  });
});
