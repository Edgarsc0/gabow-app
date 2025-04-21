"use client";

import React, { useState } from "react";
import { GoogleMap, useLoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];

export default function ({ mapRef, setPlaceId }) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyAvENu8yAr2xlZR2sqlBg9t3n35_ZpNB4M", // 🔐 Reemplaza esto si haces deploy
        libraries,
    });

    const [autocomplete, setAutocomplete] = useState(null);
    const [direccion, setDireccion] = useState("");
    const [coordenadas, setCoordenadas] = useState(null);

    const onLoad = (auto) => setAutocomplete(auto);

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();            
            if (!place.geometry) return;
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setDireccion(place.formatted_address);
            setCoordenadas({ lat, lng });
            setPlaceId(autocomplete.getPlace().place_id);
            mapRef.current?.flyTo({
                center: [lng, lat],
                zoom: 14,
                duration: 2000,
                essential: true,
            });
        }
    };

    const geocodeDireccion = async () => {
        if (!direccion) return;
        try {
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=AIzaSyAvENu8yAr2xlZR2sqlBg9t3n35_ZpNB4M`
            );
            const data = await res.json();
            if (data.status === "OK") {
                const loc = data.results[0].geometry.location;
                setCoordenadas(loc);
                mapRef.current?.flyTo({
                    center: [loc.lng, loc.lat],
                    zoom: 14,
                    duration: 2000,
                    essential: true,
                });
            } else {
                console.error("Geocoding error:", data.status);
            }
        } catch (error) {
            console.log("Fetch geocoding error:", error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            geocodeDireccion();
        }
    };

    if (!isLoaded) return <p>Cargando ...</p>;

    return (
        <div className="max-w-xl mx-auto rounded">
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                </div>
                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                    <input
                        type="search"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="text-white block w-full p-3 ps-10 text-sm placeholder-gray-400 border border-gray-600 rounded-lg bg-gray-900/80 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Buscar ubicación..."
                    />
                </Autocomplete>
            </div>
        </div>
    );
}
