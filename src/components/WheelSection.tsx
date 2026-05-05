import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Input } from './ui/Input';
import { Accordion } from './ui/Accordion';
import { AlertTriangle } from 'lucide-react';
import { CONSTANTS } from '../lib/constants';
import type { ReportFormData } from '../lib/schema';

interface WheelSectionProps {
  position: keyof ReportFormData['wheels_data'];
}

/**
 * Sekcja formularza dla pojedynczego koła.
 * Wykorzystuje useWatch do dynamicznych ostrzeżeń biznesowych (bieżnik).
 */
export const WheelSection: React.FC<WheelSectionProps> = ({ position }) => {
  const { register, control, formState: { errors } } = useFormContext<ReportFormData>();
  const namePrefix = `wheels_data.${position}` as const;

  // Nasłuchiwanie na wartość bieżnika dla "miękkiego" ostrzeżenia
  const treadDepth = useWatch({
    control,
    name: `${namePrefix}.tread_depth`,
  });

  const positionLabel = CONSTANTS.WHEEL_LABELS[position];
  const wheelErrors = errors.wheels_data?.[position];

  const hasTreadWarning = treadDepth !== undefined && 
                           treadDepth > 0 && 
                           treadDepth < CONSTANTS.MIN_TREAD_WARNING;

  return (
    <Accordion title={positionLabel} defaultOpen={position === 'FL'}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Marka opony"
          placeholder="np. Bridgestone"
          error={wheelErrors?.brand?.message}
          {...register(`${namePrefix}.brand`)}
        />
        <Input
          label="Rozmiar"
          placeholder="np. 205/55 R16"
          error={wheelErrors?.size?.message}
          {...register(`${namePrefix}.size`)}
        />
        <div className="space-y-1">
          <Input
            label="Głębokość bieżnika (mm)"
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="np. 5.5"
            error={wheelErrors?.tread_depth?.message}
            {...register(`${namePrefix}.tread_depth`)}
          />
          {hasTreadWarning && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200 mt-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">
                Uwaga: Bieżnik poniżej normy ({CONSTANTS.MIN_TREAD_WARNING}mm)!
              </span>
            </div>
          )}
        </div>
        <Input
          label="Kod DOT"
          placeholder="WWYY (np. 2417)"
          inputMode="numeric"
          maxLength={4}
          error={wheelErrors?.dot?.message}
          {...register(`${namePrefix}.dot`)}
        />
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor={`${namePrefix}-rating`} className="text-sm font-semibold text-gray-700 ml-1">
            Ocena (1-5)
          </label>
          <select
            id={`${namePrefix}-rating`}
            aria-invalid={!!wheelErrors?.rating}
            aria-describedby={wheelErrors?.rating?.message ? `${namePrefix}-rating-error` : undefined}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue=""
            {...register(`${namePrefix}.rating`)}
          >
            <option value="" disabled>Wybierz ocenę...</option>
            <option value="1">1 - Zła</option>
            <option value="2">2 - Słaba</option>
            <option value="3">3 - Średnia</option>
            <option value="4">4 - Dobra</option>
            <option value="5">5 - Bardzo dobra</option>
          </select>
          {wheelErrors?.rating?.message && (
            <span id={`${namePrefix}-rating-error`} className="text-xs text-red-500 font-medium ml-1" role="alert">
              {wheelErrors.rating.message}
            </span>
          )}
        </div>
        <Input
          label="Uwagi (opcjonalnie)"
          placeholder="Dodatkowe informacje..."
          error={wheelErrors?.notes?.message}
          {...register(`${namePrefix}.notes`)}
        />
      </div>
    </Accordion>
  );
};
