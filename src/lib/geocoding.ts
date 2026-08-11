export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  try {
    const encoded = encodeURIComponent(address);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`, {
      headers: {
        'User-Agent': 'HomeHub-Rental-Platform/1.0',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim geocoding error:', err);
  }

  // Fallback default coordinates if address resolution misses
  const lower = address.toLowerCase();
  if (lower.includes('mumbai') || lower.includes('bandra')) return { lat: 19.0760, lng: 72.8777 };
  if (lower.includes('bangalore') || lower.includes('bengaluru') || lower.includes('koramangala') || lower.includes('indiranagar')) return { lat: 12.9716, lng: 77.5946 };
  if (lower.includes('delhi') || lower.includes('gurgaon') || lower.includes('noida')) return { lat: 28.6139, lng: 77.2090 };
  if (lower.includes('hyderabad') || lower.includes('hitec')) return { lat: 17.3850, lng: 78.4867 };
  if (lower.includes('pune')) return { lat: 18.5204, lng: 73.8567 };

  // General default (Bangalore tech hub)
  return { lat: 12.9716, lng: 77.5946 };
}
