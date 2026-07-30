import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Cloudy,
  Sun,
  type LucideIcon,
} from 'lucide-react';

const snowCodes = new Set([71, 73, 75, 77, 85, 86]);
const drizzleCodes = new Set([51, 53, 55, 56, 57]);
const rainCodes = new Set([61, 63, 65, 66, 67, 80, 81, 82]);
const stormCodes = new Set([95, 96, 99]);
const fogCodes = new Set([45, 48]);

export function getWeatherIcon(code: number): LucideIcon {
  if (code === 0) return Sun;
  if (code === 1 || code === 2) return CloudSun;
  if (code === 3) return Cloudy;
  if (fogCodes.has(code)) return CloudFog;
  if (stormCodes.has(code)) return CloudLightning;
  if (snowCodes.has(code)) return CloudSnow;
  if (rainCodes.has(code)) return CloudRainWind;
  if (drizzleCodes.has(code)) return CloudDrizzle;
  return Cloud;
}
