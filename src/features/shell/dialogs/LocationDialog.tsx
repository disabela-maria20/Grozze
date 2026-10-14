'use client';

import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LocationPicker,
  locationOptions,
  nearestCinema,
  type PickedPlace,
} from '@/entities/cinema';
import { ipLocation } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { normalize } from '@/shared/lib/text';
import { Button, Icon } from '@/shared/ui';

/**
 * Asks where the user goes to the movies: the browser position, or a state
 * and city picked by hand (only the ones with cinemas in the catalog). With
 * no city yet, the IP's approximate location preselects the nearest one for
 * the user to confirm.
 */
export function LocationDialog() {
  const location = useAppStore((s) => s.location);
  const setLocationManual = useAppStore((s) => s.setLocationManual);
  const setLocationGeo = useAppStore((s) => s.setLocationGeo);
  const toast = useAppStore((s) => s.toast);
  const options = useMemo(() => locationOptions(), []);
  const citiesOf = (uf: string) =>
    options.find((option) => option.uf === uf)?.cities ?? [];

  // Starts on the current city when the catalog has it
  const currentCity = citiesOf(location.uf ?? '').find(
    (city) => normalize(city) === normalize(location.city)
  );
  const [picked, setPicked] = useState<PickedPlace | null>(
    currentCity ? { uf: location.uf!, city: currentCity } : null
  );

  // No city yet: guess it from the IP (the nearest catalog city to it)
  const guess = useQuery({
    queryKey: ['ip-location'],
    queryFn: ipLocation,
    enabled: !currentCity,
    staleTime: Infinity,
    retry: false,
  });
  const suggestion = useMemo(() => {
    const nearest = guess.data && nearestCinema(guess.data);
    if (!nearest) return null;
    const city = options
      .find((option) => option.uf === nearest.uf)
      ?.cities.find((name) => normalize(name) === normalize(nearest.city));
    return city ? { uf: nearest.uf, city } : null;
  }, [guess.data, options]);

  // The user's own choice wins over the suggestion
  const uf = picked?.uf ?? suggestion?.uf ?? '';
  const city = picked ? picked.city : (suggestion?.city ?? '');
  const suggested = !picked && !!suggestion;
  const stateName = options.find((option) => option.uf === uf)?.name;
  const stateSelect = useRef<HTMLSelectElement>(null);

  /** Asks the browser for the current position; on failure, offers the manual choice. */
  const geolocate = () => {
    const chooseManually = () => {
      toast(
        'Não foi possível obter sua localização. Escolha o estado e a cidade.'
      );
      stateSelect.current?.focus();
    };
    if (!navigator.geolocation) {
      chooseManually();
      return;
    }
    toast('Aguardando permissão de localização…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        const nearest = nearestCinema(position);
        setLocationGeo(
          position,
          nearest ? { city: nearest.city, uf: nearest.uf } : null
        );
      },
      chooseManually,
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  return (
    <div>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        Onde você quer ir ao cinema?
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Para mostrar as sessões perto de você, use sua localização ou, se
        preferir, escolha o estado e a cidade manualmente.
      </p>
      {suggested && (
        <p className="text-sm text-[#cbd5cd] leading-relaxed mb-5 -mt-2">
          Pela sua conexão, parece que você está perto de{' '}
          <strong className="text-lime">
            {city}, {stateName}
          </strong>
          . Confirme ou escolha outra cidade.
        </p>
      )}
      <Button primary={!suggested} full onClick={geolocate}>
        <Icon name="pin" className="w-[18px] h-[18px]" />
        Usar minha localização
      </Button>
      <div className="text-[11px] text-faint text-center my-4 tracking-[0.12em]">
        ou escolha manualmente
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (uf && city) setLocationManual({ city, uf });
        }}
      >
        <LocationPicker
          options={options}
          value={{ uf, city }}
          onChange={setPicked}
          stateRef={stateSelect}
        />
        <Button full primary={suggested} type="submit" disabled={!uf || !city}>
          Usar esta cidade
        </Button>
      </form>
      <p className="text-xs text-faint leading-relaxed mt-4">
        Sua posição exata não é salva: guardamos só o nome da cidade. Você pode
        trocar quando quiser pelo ícone de localização.
      </p>
    </div>
  );
}
