import { z } from 'zod';
import { CONSTANTS } from './constants';

/**
 * Schemat walidacji pojedynczej opony.
 * Walidacja techniczna (twarda) - nie zawiera ostrzeżeń biznesowych.
 */
export const TireSchema = z.object({
  brand: z.string().min(1, 'Marka opony jest wymagana'),
  size: z.string().min(1, 'Rozmiar opony jest wymagany'),
  tread_depth: z.coerce
    .number()
    .min(0, 'Głębokość nie może być ujemna')
    .max(20, 'Głębokość wydaje się nieprawidłowa'),
  dot: z.string().regex(CONSTANTS.DOT_REGEX, 'Nieprawidłowy format DOT (WWYY)'),
  rating: z.coerce.number().min(1).max(5),
  notes: z.string().optional(),
});

/**
 * Główny schemat raportu.
 */
export const ReportSchema = z.object({
  marka: z.string().min(1, 'Marka pojazdu jest wymagana'),
  model: z.string().min(1, 'Model pojazdu jest wymagany'),
  vin: z.string().regex(CONSTANTS.VIN_REGEX, 'Nieprawidłowy VIN (17 znaków, bez I, O, Q)'),
  email: z.string().email('Nieprawidłowy adres email').optional().or(z.literal('')),
  wheels_data: z.object({
    FL: TireSchema,
    FR: TireSchema,
    RL: TireSchema,
    RR: TireSchema,
  }),
});

export type TireData = z.infer<typeof TireSchema>;
export type ReportFormData = z.infer<typeof ReportSchema>;
