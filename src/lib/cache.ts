import { Preferences } from '@capacitor/preferences';

export async function setCache(key: string, value: any) {
  await Preferences.set({
    key,
    value: JSON.stringify(value),
  });
}

export async function getCache<T>(key: string): Promise<T | null> {
  const { value } = await Preferences.get({ key });
  if (value) {
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error('Failed to parse cache', e);
      return null;
    }
  }
  return null;
}

export async function removeCache(key: string) {
  await Preferences.remove({ key });
}
