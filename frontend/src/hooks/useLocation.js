import { useState, useEffect } from 'react';

/**
 * Custom hook to get current geolocation.
 * Falls back to a default location if denied or unavailable.
 */
export const useLocation = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        console.error('Geo error:', err);
        setError(err.message);
        setLoading(false);
        // Default to a central rural coordinate (e.g., near Hubli, Karnataka) if failed
        // This ensures the demo still shows "Nearby" logic
        setCoords({ lat: 15.3647, lng: 75.1240 }); 
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  return { coords, error, loading };
};
