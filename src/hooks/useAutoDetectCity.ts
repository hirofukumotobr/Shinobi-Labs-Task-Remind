import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { reverseGeocodeCity } from '../utils/geocoding';
import { useLang, useT } from '../i18n/useT';

export function useAutoDetectCity() {
  const t = useT();
  const lang = useLang();
  const weatherCities = useAppStore((s) => s.weatherCities);
  const addWeatherCity = useAppStore((s) => s.addWeatherCity);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    if (weatherCities.length > 0) return;
    if (!navigator.geolocation) return;

    attempted.current = true;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const city = await reverseGeocodeCity(latitude, longitude, lang);
      addWeatherCity(city ?? t.weatherAutoDetectedFallback, latitude, longitude);
    });
  }, [weatherCities.length, addWeatherCity, t, lang]);
}
