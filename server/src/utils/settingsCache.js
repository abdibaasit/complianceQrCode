import { PlatformSettings } from '../models/PlatformSettings.js';

let cachedSettings = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

export const getCachedSettings = async () => {
  const now = Date.now();
  if (cachedSettings && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  try {
    let settings = await PlatformSettings.findOne().lean();
    if (!settings) {
      settings = await PlatformSettings.create({});
      settings = settings.toObject ? settings.toObject() : settings;
    }
    cachedSettings = settings;
    lastFetchTime = now;
    return cachedSettings;
  } catch (err) {
    if (cachedSettings) return cachedSettings;
    return {};
  }
};

export const invalidateSettingsCache = () => {
  cachedSettings = null;
  lastFetchTime = 0;
};
