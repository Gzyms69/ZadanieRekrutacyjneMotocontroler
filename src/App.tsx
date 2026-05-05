import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Toaster, toast } from 'sonner';
import { ClipboardCheck, Loader2, FlaskConical, CheckCircle2, FilePlus2 } from 'lucide-react';

import { ReportSchema, type ReportFormData } from './lib/schema';
import { CONSTANTS } from './lib/constants';
import { supabaseService } from './services/supabaseService';

import { VehicleDetails } from './components/VehicleDetails';
import { WheelSection } from './components/WheelSection';

/**
 * Przykładowe dane do szybkiego testowania formularza.
 */
const EXAMPLE_DATA: ReportFormData = {
  marka: 'Toyota',
  model: 'Corolla',
  vin: 'WVWZZZ3CZWE123456',
  email: '',
  wheels_data: {
    FL: { brand: 'Bridgestone', size: '205/55 R16', tread_depth: 5.5, dot: '2417', rating: 4, notes: '' },
    FR: { brand: 'Bridgestone', size: '205/55 R16', tread_depth: 5.2, dot: '2417', rating: 4, notes: '' },
    RL: { brand: 'Michelin', size: '205/55 R16', tread_depth: 1.2, dot: '1020', rating: 2, notes: 'Wymaga pilnej wymiany' },
    RR: { brand: 'Michelin', size: '205/55 R16', tread_depth: 6.0, dot: '1020', rating: 5, notes: '' },
  },
};

/**
 * Generuje domyślne wartości formularza korzystając z CONSTANTS.WHEEL_POSITIONS.
 * tread_depth i rating startują puste - wymuszają świadomy wpis.
 */
const createDefaultValues = () => ({
  marka: '',
  model: '',
  vin: '',
  email: '',
  wheels_data: Object.fromEntries(
    CONSTANTS.WHEEL_POSITIONS.map((pos) => [
      pos,
      { brand: '', size: '', tread_depth: '' as unknown as number, dot: '', rating: '' as unknown as number, notes: '' },
    ])
  ) as ReportFormData['wheels_data'],
});

const App: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const methods = useForm<ReportFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- z.preprocess inferuje 'unknown', cast wymagany
    resolver: zodResolver(ReportSchema) as any,
    defaultValues: createDefaultValues(),
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  const onSubmit = async (data: ReportFormData) => {
    try {
      // Prosty Rate Limiting w LocalStorage
      const lastSubmit = localStorage.getItem('last_tire_report_submit');
      const now = Date.now();
      if (lastSubmit && now - parseInt(lastSubmit) < 10000) {
        toast.error('Zwolnij! Możesz wysłać kolejny raport za kilka sekund.');
        return;
      }

      await supabaseService.saveReport(data);
      
      localStorage.setItem('last_tire_report_submit', now.toString());
      setIsSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nieznany błąd';
      console.error('Błąd zapisu raportu:', message);
      toast.error('Błąd podczas zapisywania raportu. Sprawdź połączenie i spróbuj ponownie.');
    }
  };

  /**
   * Uzupełnia formularz przykładowymi danymi (w tym jedną oponą z bieżnikiem < 1.6mm).
   */
  const fillExampleData = () => {
    reset(EXAMPLE_DATA);
    toast.info('Wypełniono przykładowymi danymi. Sprawdź sekcję "Tył - Lewe" — bieżnik poniżej normy.');
  };

  /**
   * Resetuje formularz i wraca do widoku formularza po udanym zapisie.
   */
  const handleNewReport = () => {
    reset(createDefaultValues());
    setIsSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors />
      
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                Motocontroler
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                System Oceny Stanu Ogumienia
              </p>
            </div>
          </div>
          {!isSuccess && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fillExampleData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors uppercase tracking-wider"
                title="Wypełnij formularz przykładowymi danymi"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dane testowe</span>
              </button>
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-widest">
                Dostęp Publiczny
              </span>
            </div>
          )}
        </header>

        {isSuccess ? (
          /* Ekran potwierdzenia po udanym zapisie */
          <div className="text-center py-16 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Raport zapisany!
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Dane zostały pomyślnie przesłane do systemu. Możesz teraz dodać kolejny raport lub zamknąć stronę.
            </p>
            <button
              type="button"
              onClick={handleNewReport}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              <FilePlus2 className="w-5 h-5" />
              Dodaj kolejny raport
            </button>
          </div>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
              {/* Dane Pojazdu */}
              <VehicleDetails />

              {/* Dane Opon */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
                    Ocena 4 kół
                  </h2>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                {/* Układ Grid na Desktopie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Koła Lewe */}
                  <div className="space-y-4">
                    <WheelSection position="FL" />
                    <WheelSection position="RL" />
                  </div>

                  {/* Koła Prawe */}
                  <div className="space-y-4">
                    <WheelSection position="FR" />
                    <WheelSection position="RR" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Zapisywanie raportu...
                    </>
                  ) : (
                    'Zapisz i prześlij raport'
                  )}
                </button>
              </div>
            </form>
          </FormProvider>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 pb-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            Motocontroler &copy; 2026 • System Rzeczoznawczy
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
