import type { Lang } from '../types';

export interface CitySearchResult {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export async function reverseGeocodeCity(
  latitude: number,
  longitude: number,
  lang: Lang = 'pt',
): Promise<string | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${lang}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json.city || json.locality || json.principalSubdivision || null;
  } catch {
    return null;
  }
}

export async function searchCities(query: string, lang: Lang = 'pt'): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&language=${lang}&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results ?? []).map((r: { name: string; admin1?: string; country?: string; latitude: number; longitude: number }) => ({
      name: r.name,
      admin1: r.admin1,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch {
    return [];
  }
}
