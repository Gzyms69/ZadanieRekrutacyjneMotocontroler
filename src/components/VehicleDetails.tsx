import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import type { ReportFormData } from '../lib/schema';

/**
 * Sekcja danych pojazdu.
 */
export const VehicleDetails: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ReportFormData>();

  return (
    <Card title="Dane Pojazdu">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Marka"
          placeholder="np. Toyota"
          error={errors.marka?.message}
          {...register('marka')}
        />
        <Input
          label="Model"
          placeholder="np. Corolla"
          error={errors.model?.message}
          {...register('model')}
        />
        <Input
          label="VIN"
          placeholder="17 znaków"
          error={errors.vin?.message}
          {...register('vin')}
        />
        <Input
          label="Email zgłaszającego (opcjonalnie)"
          type="email"
          placeholder="Twoje dane kontaktowe"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
    </Card>
  );
};
