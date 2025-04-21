"use client"

// app/map/page.tsx
import dynamic from 'next/dynamic';



//const MapGlobe = dynamic(() => import('./Mapcomponents/Map'), { ssr: false });
const Map = dynamic(() => import("./components/Map"), { ssr: false });

export default function MapPage() {
  return (

    <main className="w-full h-screen">
      <Map />
    </main>
  );
}
