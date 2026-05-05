import { supabase } from '../api/supabase';
import type { ReportFormData } from '../lib/schema';

/**
 * Serwis obsługujący komunikację z bazą danych Supabase.
 * Warstwa abstrakcji izolująca logikę API od komponentów.
 */
export const supabaseService = {
  /**
   * Zapisuje nowy raport opon w bazie danych.
   */
  async saveReport(data: ReportFormData) {
    const { error } = await supabase
      .from('reports')
      .insert(data);

    if (error) {
      console.error('Błąd zapisu w Supabase:', error);
      throw error;
    }

    return { success: true };
  },
};
