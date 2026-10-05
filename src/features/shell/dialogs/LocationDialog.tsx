'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/shared/store';
import { CITY_OPTIONS, locationSchema, type LocationValues } from '../schema';
import { Button, Field, inputClass, Icon } from '@/shared/ui';

export function LocationDialog() {
  const setLocationManual = useAppStore((s) => s.setLocationManual);
  const setLocationGeo = useAppStore((s) => s.setLocationGeo);
  const toast = useAppStore((s) => s.toast);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: { city: CITY_OPTIONS[0] },
  });

  /** Asks the browser for the current position; failures fall back to a toast. */
  const geolocate = () => {
    if (!navigator.geolocation) {
      toast('Localização indisponível. Selecione a cidade manualmente.');
      return;
    }
    toast('Aguardando permissão de localização…');
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setLocationGeo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () =>
        toast(
          'Não foi possível obter a localização. Você pode selecionar São Paulo manualmente.'
        ),
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  return (
    <div>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        Onde você quer ir ao cinema?
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Escolha a região ou autorize sua localização. Esta amostra tem
        programação somente para São Paulo, SP.
      </p>
      <Button primary full onClick={geolocate}>
        <Icon name="pin" className="w-[18px] h-[18px]" />
        Usar minha localização
      </Button>
      <div className="text-[11px] text-faint text-center my-4 tracking-[0.12em]">
        ou escolha manualmente
      </div>
      <form
        // Only São Paulo has programming in this sample
        onSubmit={handleSubmit(() => setLocationManual())}
      >
        <Field label="Cidade" error={errors.city?.message}>
          <select className={inputClass} {...register('city')}>
            {CITY_OPTIONS.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </Field>
        <Button full type="submit">
          Usar São Paulo
        </Button>
      </form>
      <p className="text-xs text-faint leading-relaxed mt-4">
        A posição precisa é opcional. Em celulares, o recurso deve ser testado
        por uma URL HTTPS.
      </p>
    </div>
  );
}
