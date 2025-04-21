"use client"

import { useRef, useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { RotateCcw, Locate, Moon, Sun, Menu, X, MapPin, Trash2 } from "lucide-react"
import Image from "next/image"
import SearchInput from "./SearchInput"
import { Fade } from "react-awesome-reveal"
import User from "./User"
import SlideBar from "./SlideBar"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY

const MapGlobe = () => {
    const mapContainerRef = useRef(null)
    const markerRef = useRef(null)
    const mapRef = useRef(null)
    const userInteracting = useRef(false)
    const spinEnabled = useRef(true)
    const [isResetting, setIsResetting] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const [locationError, setLocationError] = useState(null)
    const [logoLoaded, setLogoLoaded] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [placeId, setPlaceId] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    const [ruta, setRuta] = useState(null)
    const [zoomLevel, setZoomLevel] = useState(0);
    const estadioCoords = [-99.15047, 19.30279]; // Longitud,

    

    //setPlaceId(ChIJhQcnon__zYURa0HR17b18uA) PERISUR

    //setPlaceId(ChIJP1dJRVf_0YURr8MZosHl4kI) chapultepec

    const borrarRuta = () => {
        if (!mapRef.current) return

        const map = mapRef.current

        if (map.getLayer("ruta-layer")) {
            map.removeLayer("ruta-layer")
        }

        if (map.getSource("ruta-linea")) {
            map.removeSource("ruta-linea")
        }

        setRuta(null)
        if (isMobile) setIsMobileMenuOpen(false)
    }

    const mostrarDetalles = () => {
        setIsOpen(true)
        if (isMobile) setIsMobileMenuOpen(false)
    }

    useEffect(() => {
        if (!mapRef.current || !ruta) return

        const map = mapRef.current

        // Coordenadas en formato [lng, lat]
        const coordinates = ruta.ruta.map((punto) => [punto.coordenadas.lon, punto.coordenadas.lat])

        // Verifica si la fuente ya existe
        if (map.getSource("ruta-linea")) {
            map.getSource("ruta-linea").setData({
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates,
                },
            })
        } else {
            map.addSource("ruta-linea", {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates,
                    },
                },
            })

            map.addLayer({
                id: "ruta-layer",
                type: "line",
                source: "ruta-linea",
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#007AFF", // Azul estilo Google Maps
                    "line-width": 6,
                },
            })
        }

        // Centrar mapa en la ruta
        const bounds = coordinates.reduce(
            (b, coord) => b.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
        )
        map.fitBounds(bounds, { padding: 50 })
    }, [ruta])

    useEffect(() => {
        if (placeId) {
            setIsOpen(true)
        }
    }, [placeId])

    // Map styles
    const mapStyles = {
        light: "mapbox://styles/mapbox/streets-v11",
        dark: "mapbox://styles/mapbox/dark-v11",
    }

    // Initial map settings
    const initialState = {
        zoom: 1,
        center: [-80, 15], //
        projection: "globe",
    }

    // Check if device is mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkIfMobile()
        window.addEventListener("resize", checkIfMobile)

        return () => {
            window.removeEventListener("resize", checkIfMobile)
        }
    }, [])

    const resetView = () => {
        if (!mapRef.current) return

        setIsResetting(true)

        mapRef.current.easeTo({
            center: initialState.center,
            zoom: initialState.zoom,
            duration: 5500,
            easing: (n) => n,
            essential: true,
        })

        // Re-enable spinning after reset
        userInteracting.current = false
        spinEnabled.current = true

        setTimeout(() => setIsResetting(false), 1000)
        if (isMobile) setIsMobileMenuOpen(false)
    }

    const goToUserLocation = () => {
        setIsLocating(true)
        setLocationError(null)

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser")
            setIsLocating(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (!mapRef.current) return

                // Stop auto-spinning when focusing on user location
                spinEnabled.current = false

                mapRef.current.flyTo({
                    center: [position.coords.longitude, position.coords.latitude],
                    zoom: 13,
                    duration: 5500,
                    essential: true,
                })

                setIsLocating(false)
                if (isMobile) setIsMobileMenuOpen(false)
            },
            (error) => {
                setLocationError(`Error: ${error.message}`)
                setIsLocating(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            },
        )
    }

    const handleSearch = (e) => {
        e.preventDefault()
        // Here you would implement the actual search functionality
        console.log("Searching for:", searchQuery)
        // For now, we'll just log the search query
        if (isMobile) setIsMobileMenuOpen(false)
    }

    // Observador de nivel de zoom
    const handleZoom = () => {
        const currentZoom = map.getZoom();
        setZoomLevel(currentZoom);
          
        if (currentZoom > 10 && currentZoom < 15) {
            if (!markerRef.current) {
              markerRef.current = new mapboxgl.Marker({
                element: createCustomIcon(), // función que devuelve el nodo HTML con la imagen
                anchor: 'bottom',
              })
                .setLngLat(estadioCoords)
                .addTo(map);
            }
          } else {
            if (markerRef.current) {
              markerRef.current.remove();
              markerRef.current = null;
            }
          }
    };
    

    const toggleDarkMode = () => {
        if (!mapRef.current) return

        const newDarkModeState = !isDarkMode
        setIsDarkMode(newDarkModeState)

        const style = newDarkModeState ? mapStyles.dark : mapStyles.light
        mapRef.current.setStyle(style)

        // Re-add fog after style change
        mapRef.current.once("style.load", () => {
            mapRef.current.setFog({})
        })

        if (isMobile) setIsMobileMenuOpen(false)
    }

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: isDarkMode ? mapStyles.dark : mapStyles.light,
            projection: initialState.projection,
            zoom: initialState.zoom,
            center: initialState.center,
        })

        mapRef.current = map

        map.addControl(new mapboxgl.NavigationControl())
        map.scrollZoom.enable()
        map.scrollZoom.setWheelZoomRate(0.02) // Adjust the zoom speed (lower is slower)

        // Enable touch rotation for mobile
        map.touchZoomRotate.enable()
        map.touchPitch.enable()

        map.on("style.load", () => {
            map.setFog({})
        })
        // Cargar icono personalizado
        map.on('load', () => {
            map.loadImage('/icons/estadio.png', (error, image) => {
            if (error) throw error;
  
            if (!map.hasImage('estadio-icon') && image) {
                map.addImage('estadio-icon', image);
            }
            });
        });

        const secondsPerRevolution = 240
        const maxSpinZoom = 5
        const slowSpinZoom = 3

        const spinGlobe = () => {
            if (!mapRef.current) return
            const zoom = map.getZoom()
            if (spinEnabled.current && !userInteracting.current && zoom < maxSpinZoom) {
                let distancePerSecond = 360 / secondsPerRevolution
                if (zoom > slowSpinZoom) {
                    const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom)
                    distancePerSecond *= zoomDif
                }
                const center = map.getCenter()
                center.lng -= distancePerSecond
                map.easeTo({ center, duration: 500, easing: (n) => n })
            }
        }

        map.on("mousedown", () => (userInteracting.current = true))
        map.on("touchstart", () => (userInteracting.current = true))
        map.on("dragstart", () => (userInteracting.current = true))
        map.on("moveend", spinGlobe)

        spinGlobe()
    }, [])

    useEffect(() => {
        if (!mapRef.current) return;
        
        const map = mapRef.current;

        // Función para agregar marcadores
        const addMarker = (lngLat, iconUrl, placeId, zoomLevel = 16) => {
            // Crea un elemento HTML para el ícono
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.backgroundImage = `url('${iconUrl}')`;
            el.style.width = '80px';
            el.style.height = '80px';
            el.style.backgroundSize = 'contain';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.border = 'none';
            el.style.display = 'block';

            // Crear marcador y agregarlo al mapa
            const marker = new mapboxgl.Marker(el)
                .setLngLat(lngLat)
                .addTo(map);

            // Evento de clic en el marcador
            marker.getElement().addEventListener('click', () => {


                // Realizar el zoom hacia el marcador
                map.flyTo({
                    center: lngLat,
                    zoom: zoomLevel,
                    speed: 1.5,
                    curve: 1,
                    essential: true
                });

                // Acción con el placeId (por ejemplo, actualización del estado)
                setPlaceId(placeId);  // Actualiza el placeId al hacer clic en el marcador
                setIsOpen(true);  // Acciones adicionales que desees realizar
            });

            return marker;
        };

        // Agregar diferentes marcadores con el placeId
        const marker1 = addMarker([-99.15047, 19.30279], '/icons/estadio.png', 'ChIJGQkBCFIAzoURlLaQUWnuYZc');
        const marker2 = addMarker([-99.18940, 19.41968], '/icons/park.png', 'ChIJP1dJRVf_0YURr8MZosHl4kI');
        const marker3 = addMarker([-99.19027, 19.30447], '/icons/shopping-bag.png', 'ChIJhQcnon__zYURa0HR17b18uA');

        // Función para controlar la visibilidad del marcador según el zoom
        const checkZoom = () => {
            const zoom = map.getZoom(); // Obtiene el nivel de zoom actual

            if (zoom >= 10 && zoom <= 15) {
                marker1.getElement().style.display = 'block';
                marker2.getElement().style.display = 'block';
                marker3.getElement().style.display = 'block';
            } else {
                marker1.getElement().style.display = 'none';
                marker2.getElement().style.display = 'none';
                marker3.getElement().style.display = 'none';
            }
        };

        // Llamar la función cuando el mapa cambie de zoom
        map.on('zoom', checkZoom);

        // Verifica el estado inicial del zoom al cargar el mapa
        checkZoom();

        return () => {
            map.off('zoom', checkZoom);
        };
    }, []);
    


    
    

    return (

        
        <Fade duration={3000}>
            
            <div className="relative w-full h-screen">
                <SlideBar isOpen={isOpen} onClose={() => setIsOpen(false)} place={placeId} setRuta={setRuta} />

                <div ref={mapContainerRef} className="w-full h-full" />

                <User />

                {/* Logo */}
                <div
                    className={`absolute top-4 left-4 transition-all duration-700 transform ${logoLoaded ? "translate-y-0 opacity-100" : "translate-y-[-20px] opacity-0"} ${isMobile ? "max-w-[120px]" : ""}`}
                >
                    <div
                        className={`${isDarkMode ? "bg-gray-800 bg-opacity-85" : "bg-white bg-opacity-85"} backdrop-blur-sm p-2 md:p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                    >
                        <Image
                            src="/gabow_ligth.png"
                            alt="Gabow Logo"
                            width={isMobile ? 120 : 180}
                            height={isMobile ? 47 : 70}
                            className="h-auto"
                            onLoad={() => setLogoLoaded(true)}
                            priority
                        />
                    </div>

                    {/* Contenedor de banderas lado a lado */}
                    <div className="mt-5 flex gap-2">
                        <div className="bg-opacity-85 p-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg animate-pulse">
                            <Image
                                src="/mexico.png"
                                alt="Bandera de Mexico"
                                width={isMobile ? 60 : 90}
                                height={isMobile ? 30 : 45}
                                className="h-auto rounded-lg"
                                onLoad={() => setLogoLoaded(true)}
                                priority
                            />
                        </div>
                        <div className="bg-opacity-85 p-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg animate-pulse">
                            <Image
                                src="/mundial.webp"
                                alt="Otra bandera"
                                width={isMobile ? 60 : 90}
                                height={isMobile ? 30 : 45}
                                className="h-auto rounded-lg"
                                onLoad={() => setLogoLoaded(true)}
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div
                    className={`absolute ${isMobile ? "top-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-130px)]" : "top-4 left-1/2 transform -translate-x-1/2 flex items-center h-[86px] w-full max-w-md px-4"}`}
                >
                    <form onSubmit={handleSearch} className="relative w-full">
                        <SearchInput mapRef={mapRef} setPlaceId={setPlaceId} />
                    </form>
                </div>

                {/* Mobile Menu Toggle */}
                {isMobile && (
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`absolute bottom-6 right-6 z-50 ${isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"
                            } rounded-full p-3 shadow-lg transition-all duration-300`}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                )}

                {/* Control buttons - Desktop */}
                {!isMobile && (
                    <div className="absolute bottom-6 right-6 flex flex-col gap-3">
                        <button
                            onClick={toggleDarkMode}
                            className={`${isDarkMode ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
                                } rounded-full p-3 shadow-lg transition-colors duration-200`}
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={goToUserLocation}
                            disabled={isLocating}
                            className={`${isDarkMode
                                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700 disabled:opacity-50"
                                    : "bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                } rounded-full p-3 shadow-lg transition-colors duration-200`}
                            aria-label="Go to my location"
                        >
                            <Locate className="w-5 h-5" />
                        </button>

                        <button
                            onClick={resetView}
                            disabled={isResetting}
                            className={`${isDarkMode
                                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700 disabled:opacity-50"
                                    : "bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                } rounded-full p-3 shadow-lg transition-colors duration-200`}
                            aria-label="Reset view"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>

                        {/* Botón Mostrar Detalles - Solo visible cuando hay un placeId pero no está abierto */}
                        {!isOpen && placeId && (
                            <button
                                onClick={mostrarDetalles}
                                className={`${isDarkMode
                                        ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                    } rounded-full p-3 shadow-lg transition-colors duration-200`}
                                aria-label="Mostrar detalles"
                            >
                                <MapPin className="w-5 h-5" />
                            </button>
                        )}

                        {/* Botón Borrar Ruta - Solo visible cuando hay una ruta */}
                        {ruta && (
                            <button
                                onClick={borrarRuta}
                                className={`${isDarkMode ? "bg-gray-800 text-red-400 hover:bg-gray-700" : "bg-white text-red-500 hover:bg-gray-100"
                                    } rounded-full p-3 shadow-lg transition-colors duration-200`}
                                aria-label="Borrar ruta"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Mobile Menu */}
                {isMobile && (
                    <div
                        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                            }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div
                            className={`absolute bottom-0 right-0 p-4 mb-16 mr-4 rounded-lg shadow-xl transition-transform duration-300 transform ${isMobileMenuOpen ? "translate-y-0" : "translate-y-20"
                                } ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={toggleDarkMode}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-md ${isDarkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                                        } transition-colors duration-200`}
                                >
                                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                    <span>{isDarkMode ? "Modo claro" : "Modo oscuro"}</span>
                                </button>

                                <button
                                    onClick={goToUserLocation}
                                    disabled={isLocating}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-md ${isDarkMode
                                            ? "text-gray-200 hover:bg-gray-700 disabled:opacity-50"
                                            : "text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        } transition-colors duration-200`}
                                >
                                    <Locate className="w-5 h-5" />
                                    <span>Mi ubicación</span>
                                </button>

                                <button
                                    onClick={resetView}
                                    disabled={isResetting}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-md ${isDarkMode
                                            ? "text-gray-200 hover:bg-gray-700 disabled:opacity-50"
                                            : "text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        } transition-colors duration-200`}
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    <span>Reiniciar vista</span>
                                </button>

                                {/* Botón Mostrar Detalles en menú móvil */}
                                {!isOpen && placeId && (
                                    <button
                                        onClick={mostrarDetalles}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-md ${isDarkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                                            } transition-colors duration-200`}
                                    >
                                        <MapPin className="w-5 h-5" />
                                        <span>Mostrar detalles</span>
                                    </button>
                                )}

                                {/* Botón Borrar Ruta en menú móvil */}
                                {ruta && (
                                    <button
                                        onClick={borrarRuta}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-md ${isDarkMode ? "text-red-400 hover:bg-gray-700" : "text-red-500 hover:bg-gray-100"
                                            } transition-colors duration-200`}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <span>Borrar ruta</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* Error message */}
                {locationError && (
                    <div
                        className={`absolute ${isMobile ? "top-16" : "top-24"} left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg max-w-[90%] text-center`}
                    >
                        {locationError}
                    </div>
                )}
            </div>
        </Fade>

        
    )
}

export default MapGlobe
