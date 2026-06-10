/**
 * Singleton loader for the Google Maps JavaScript SDK.
 * Ensures the script is only injected once, regardless of how many
 * components call loadGoogleMaps().
 */
let loadPromise = null;

export function loadGoogleMaps(apiKey) {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // Already loaded
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => {
      loadPromise = null; // allow retry
      reject(new Error('Failed to load Google Maps SDK. Check API key and billing.'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
