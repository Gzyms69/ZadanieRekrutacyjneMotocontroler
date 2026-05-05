import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility do łączenia klas Tailwinda z obsługą konfliktów i warunkowego renderowania.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
