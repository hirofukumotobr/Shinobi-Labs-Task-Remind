import { useEffect, useState } from 'react';
import { useT } from '../i18n/useT';

interface DailyForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  weatherCode: number;
}

interface WeatherData {
  temperature: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  description: string;
  weatherCode: number;
  daily: DailyForecast[];
}

interface WeatherState {
  loading: boolean;
  error: string | null;
  data: WeatherData | null;
}

export function useWeather(latitude: number | null, longitude: number | null) {
  const t = useT();
  const [state, setState] = useState<WeatherState>({ loading: true, error: null, data: null });

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setState({ loading: false, error: null, data: null });
      return;
    }

    let cancelled = false;
    setState({ loading: true, error: null, data: null });

    async function load() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('weather request failed');
        const json = await res.json();
        if (cancelled) return;

        const daily: DailyForecast[] = json.daily.time.map((date: string, i: number) => ({
          date,
          tempMin: Math.round(json.daily.temperature_2m_min[i]),
          tempMax: Math.round(json.daily.temperature_2m_max[i]),
          description: t.weatherCodes[json.daily.weather_code[i]] ?? t.weatherFallbackDescription,
          weatherCode: json.daily.weather_code[i],
        }));

        setState({
          loading: false,
          error: null,
          data: {
            temperature: Math.round(json.current.temperature_2m),
            humidity: Math.round(json.current.relative_humidity_2m),
            windSpeed: Math.round(json.current.wind_speed_10m),
            tempMin: daily[0]?.tempMin ?? 0,
            tempMax: daily[0]?.tempMax ?? 0,
            description: t.weatherCodes[json.current.weather_code] ?? t.weatherFallbackDescription,
            weatherCode: json.current.weather_code,
            daily,
          },
        });
      } catch {
        if (!cancelled) setState({ loading: false, error: t.weatherError, data: null });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, t]);

  return state;
}
