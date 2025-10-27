import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const EarthBackground = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoiamFzb25nMDMiLCJhIjoiY21nZGR2dnp0MW9lMTJycHl0bDgwb2M0dyJ9.ktCzP9_99FM9DqR-tbNvYg';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [100, 20],
      zoom: 2.5,
      projection: 'globe' as any,
      interactive: false,
    });

    map.current.on('style.load', () => {
      if (!map.current) return;
      
      map.current.setFog({
        range: [-1, 2],
        'horizon-blend': 0.3,
        color: '#242B4B',
        'high-color': '#161B36',
        'space-color': '#0B1026',
        'star-intensity': 0.8,
      });
    });

    // Rotation animation
    let userInteracting = false;
    const secondsPerRevolution = 240;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;

    function spinGlobe() {
      if (!map.current || userInteracting) return;
      
      const zoom = map.current.getZoom();
      if (zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.current.getCenter();
        center.lng -= distancePerSecond;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    map.current.on('moveend', spinGlobe);
    spinGlobe();

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      className="absolute inset-0 w-full h-full"
      style={{ filter: 'brightness(0.7)' }}
    />
  );
};

export default EarthBackground;
