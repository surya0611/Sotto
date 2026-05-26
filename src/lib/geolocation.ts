export interface GeolocationData {
  city: string | null;
  region: string | null;
}

export async function getGeolocationFromIp(ip: string | null): Promise<GeolocationData> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return { city: null, region: null };
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) {
      console.warn(`Geolocation API failed with status ${response.status}`);
      return { city: null, region: null };
    }

    const data = await response.json();
    
    if (data.error) {
      console.warn(`Geolocation error: ${data.reason}`);
      return { city: null, region: null };
    }

    return {
      city: data.city || null,
      region: data.region || null,
    };
  } catch (error) {
    console.warn('Failed to fetch geolocation:', error);
    return { city: null, region: null };
  }
}
