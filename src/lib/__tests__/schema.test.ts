import { describe, it, expect } from 'vitest';
import { TireSchema, ReportSchema } from '../schema';
import { CONSTANTS } from '../constants';

// ─── VIN Validation ─────────────────────────────────────

describe('VIN validation', () => {
  it('accepts a valid 17-character VIN', () => {
    const result = ReportSchema.shape.vin.safeParse('WVWZZZ3CZWE123456');
    expect(result.success).toBe(true);
  });

  it('rejects VIN shorter than 17 characters', () => {
    const result = ReportSchema.shape.vin.safeParse('WVWZZZ3CZW');
    expect(result.success).toBe(false);
  });

  it('rejects VIN containing letter I', () => {
    const result = ReportSchema.shape.vin.safeParse('WVWZZZ3CZWI123456');
    expect(result.success).toBe(false);
  });

  it('rejects VIN containing letter O', () => {
    const result = ReportSchema.shape.vin.safeParse('WVWZZZ3CZWO123456');
    expect(result.success).toBe(false);
  });

  it('rejects VIN containing letter Q', () => {
    const result = ReportSchema.shape.vin.safeParse('WVWZZZ3CZWQ123456');
    expect(result.success).toBe(false);
  });
});

// ─── DOT Validation ─────────────────────────────────────

describe('DOT validation', () => {
  it('accepts valid DOT code (week 24, year 17)', () => {
    const result = TireSchema.shape.dot.safeParse('2417');
    expect(result.success).toBe(true);
  });

  it('accepts DOT with week 01', () => {
    const result = TireSchema.shape.dot.safeParse('0123');
    expect(result.success).toBe(true);
  });

  it('accepts DOT with week 53', () => {
    const result = TireSchema.shape.dot.safeParse('5320');
    expect(result.success).toBe(true);
  });

  it('rejects DOT with week 00', () => {
    const result = TireSchema.shape.dot.safeParse('0020');
    expect(result.success).toBe(false);
  });

  it('rejects DOT with week 54', () => {
    const result = TireSchema.shape.dot.safeParse('5420');
    expect(result.success).toBe(false);
  });

  it('rejects DOT with only 3 digits', () => {
    const result = TireSchema.shape.dot.safeParse('241');
    expect(result.success).toBe(false);
  });
});

// ─── Tread Depth Validation ─────────────────────────────

describe('Tread depth validation', () => {
  const validTire = {
    brand: 'Test', size: '205/55 R16', tread_depth: 5.0, dot: '2417', rating: 4, notes: '',
  };

  it('accepts tread depth of 0 (completely worn tire)', () => {
    const result = TireSchema.safeParse({ ...validTire, tread_depth: 0 });
    expect(result.success).toBe(true);
  });

  it('accepts tread depth of 20', () => {
    const result = TireSchema.safeParse({ ...validTire, tread_depth: 20 });
    expect(result.success).toBe(true);
  });

  it('rejects negative tread depth', () => {
    const result = TireSchema.safeParse({ ...validTire, tread_depth: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects tread depth above 20', () => {
    const result = TireSchema.safeParse({ ...validTire, tread_depth: 21 });
    expect(result.success).toBe(false);
  });

  it('rejects empty string for tread depth', () => {
    const result = TireSchema.safeParse({ ...validTire, tread_depth: '' });
    expect(result.success).toBe(false);
  });

  it('uses correct business threshold for warnings', () => {
    // The soft warning threshold should be 1.6mm
    expect(CONSTANTS.MIN_TREAD_WARNING).toBe(1.6);
  });
});

// ─── Rating Validation ──────────────────────────────────

describe('Rating validation', () => {
  const validTire = {
    brand: 'Test', size: '205/55 R16', tread_depth: 5.0, dot: '2417', rating: 4, notes: '',
  };

  it('rejects empty string for rating', () => {
    const result = TireSchema.safeParse({ ...validTire, rating: '' });
    expect(result.success).toBe(false);
  });

  it('accepts rating of 1', () => {
    const result = TireSchema.safeParse({ ...validTire, rating: 1 });
    expect(result.success).toBe(true);
  });

  it('accepts rating of 5', () => {
    const result = TireSchema.safeParse({ ...validTire, rating: 5 });
    expect(result.success).toBe(true);
  });

  it('rejects rating of 0', () => {
    const result = TireSchema.safeParse({ ...validTire, rating: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects rating of 6', () => {
    const result = TireSchema.safeParse({ ...validTire, rating: 6 });
    expect(result.success).toBe(false);
  });
});

// ─── Full Report Schema ─────────────────────────────────

describe('ReportSchema', () => {
  const validReport = {
    marka: 'Toyota',
    model: 'Corolla',
    vin: 'WVWZZZ3CZWE123456',
    email: '',
    wheels_data: {
      FL: { brand: 'Bridgestone', size: '205/55 R16', tread_depth: 5.5, dot: '2417', rating: 4, notes: '' },
      FR: { brand: 'Bridgestone', size: '205/55 R16', tread_depth: 5.2, dot: '2417', rating: 4 },
      RL: { brand: 'Michelin', size: '205/55 R16', tread_depth: 6.0, dot: '1020', rating: 5 },
      RR: { brand: 'Michelin', size: '205/55 R16', tread_depth: 5.8, dot: '1020', rating: 5 },
    },
  };

  it('accepts a complete valid report', () => {
    const result = ReportSchema.safeParse(validReport);
    expect(result.success).toBe(true);
  });

  it('rejects report without vehicle brand', () => {
    const result = ReportSchema.safeParse({ ...validReport, marka: '' });
    expect(result.success).toBe(false);
  });

  it('accepts report without email (optional field)', () => {
    const result = ReportSchema.safeParse({ ...validReport, email: '' });
    expect(result.success).toBe(true);
  });

  it('accepts report with valid email', () => {
    const result = ReportSchema.safeParse({ ...validReport, email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects report with invalid email format', () => {
    const result = ReportSchema.safeParse({ ...validReport, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });
});
