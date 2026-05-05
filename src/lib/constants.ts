/**
 * Progi biznesowe i stałe techniczne projektu
 */
export const CONSTANTS = {
  // Próg ostrzegawczy głębokości bieżnika (w mm)
  MIN_TREAD_WARNING: 1.6,
  
  // Wymagana długość numeru VIN
  VIN_LENGTH: 17,
  
  // Regex dla VIN (17 znaków, brak liter I, O, Q)
  VIN_REGEX: /^[A-HJ-NPR-Z0-9]{17}$/,
  
  // Regex dla DOT (4 cyfry: WWYY, tydzień 01-53)
  DOT_REGEX: /^(0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})$/,
  
  // Pozycje kół
  WHEEL_POSITIONS: ['FL', 'FR', 'RL', 'RR'] as const,
  
  // Mapowanie pozycji na czytelne nazwy
  WHEEL_LABELS: {
    FL: 'Przód - Lewe',
    FR: 'Przód - Prawe',
    RL: 'Tył - Lewe',
    RR: 'Tył - Prawe',
  } as const,
};
