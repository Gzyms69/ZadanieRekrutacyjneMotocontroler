import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Toaster, toast } from 'sonner';
import { ClipboardCheck, Loader2 } from 'lucide-react';

import { ReportSchema, type ReportFormData } from './lib/schema';
import { supabaseService } from './services/supabaseService';

import { VehicleDetails } from './components/VehicleDetails';
import { WheelSection } from './components/WheelSection';

const App: React.FC = () => {
  const methods = useForm<ReportFormData>({
    resolver: zodResolver(ReportSchema),
    defaultValues: {
      marka: '',
      model: '',
      vin: '',
      email: '',
      wheels_data: {
        FL: { brand: '', size: '', tread_depth: 0, dot: '', rating: 5, notes: '' },
        FR: { brand: '', size: '', tread_depth: 0, dot: '', rating: 5, notes: '' },
        RL: { brand: '', size: '', tread_depth: 0, dot: '', rating: 5, notes: '' },
        RR: { brand: '', size: '', tread_depth: 0, dot: '', rating: 5, notes: '' },
      },
    },
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
      toast.success('Raport został pomyślnie zapisany w systemie.');
      
      // Reset formularza po sukcesie
      reset();
    } catch {
      toast.error('Błąd podczas zapisywania raportu. Sprawdź połączenie i spróbuj ponownie.');
    }
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
          <div className="hidden sm:block text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-widest">
              Dostęp Publiczny
            </span>
          </div>
        </header>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
