"use client"

import { useEffect, useRef, useState } from "react"
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  Phone,
  Share2,
  Star,
  X,
  Navigation,
  Map,
} from "lucide-react"

import { useRouter } from "next/navigation"

export default function PlaceSidebar({ isOpen, onClose, place, setRuta }) {
  const [placeInfo, setPlaceInfo] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showDirections, setShowDirections] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [directionsError, setDirectionsError] = useState(null)

  const router = useRouter();

  const sidebarRef = useRef(null)

  useEffect(() => {
    const getPlaceInfo = async (place) => {
      console.log(place)
      const res = await fetch(`http://localhost:8000/lugar/?place_id=${place}`)
      const data = await res.json()
      console.log(data);
      console.log(data.imagenes[0])
      setPlaceInfo(data)
      // Reset image index when loading a new place
      setCurrentImageIndex(0)
    }
    if (place) {
      getPlaceInfo(place)
    }
  }, [place])

  // Manejar clic fuera para cerrar
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isOpen, onClose])

  // Prevenir scroll del body cuando el sidebar está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleClick = () => {
    if (placeInfo.nombre = "Bosque de Chapultepec") {
      router.push("http://tour-weld.vercel.app");
    }
  }

  // Funciones para el carrusel
  const nextImage = () => {
    if (placeInfo && placeInfo.imagenes.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex === placeInfo.imagenes.length - 1 ? 0 : prevIndex + 1))
    }
  }

  const prevImage = () => {
    if (placeInfo && placeInfo.imagenes.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? placeInfo.imagenes.length - 1 : prevIndex - 1))
    }
  }

  const goToImage = (index) => {
    setCurrentImageIndex(index)
  }

  // Funciones para las indicaciones
  const handleDirectionsClick = () => {
    setShowDirections(true)
    setDirectionsError(null)
  }

  const handleCloseDirections = () => {
    setShowDirections(false)
    setUserLocation(null)
    setDirectionsError(null)
  }

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    setDirectionsError(null)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          setIsLoadingLocation(false)

          console.log(`Iniciando ruta desde: ${latitude}, ${longitude} hasta ${placeInfo.nodo_mas_cercano.coordenadas}`)

          const res = await fetch(`http://localhost:8000/ruta/mas-corta?origen_lat=${latitude}&origen_lon=${longitude}&destino_lat=${placeInfo.nodo_mas_cercano.coordenadas[0]}&destino_lon=${placeInfo.nodo_mas_cercano.coordenadas[1]}`);
          const data = await res.json();

          setRuta(data);

          setShowDirections(true);
        },
        (error) => {
          console.error("Error obteniendo la ubicación:", error)
          setDirectionsError("No se pudo obtener tu ubicación. Por favor, verifica los permisos de ubicación.")
          setIsLoadingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      )
    } else {
      setDirectionsError("Tu navegador no soporta geolocalización")
      setIsLoadingLocation(false)
    }
  }

  const handleSelectOnMap = () => {
    // En una implementación real, aquí mostrarías un mapa para seleccionar
    // Por ahora, simularemos la selección
    alert("Selecciona un punto de inicio en el mapa")
    setShowDirections(false)

    // Simulación de selección en el mapa
    setTimeout(() => {
      const simulatedLocation = { lat: 19.4326, lng: -99.1332 }
      alert(`Iniciando navegación desde el punto seleccionado hasta ${placeInfo?.nombre || "el destino"}`)
    }, 1000)
  }

  if (placeInfo) {
    return (
      <>
        {/* Overlay de fondo */}
        {isOpen && <div className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300" onClick={onClose} />}

        {/* Sidebar - Cambiado de max-w-sm a max-w-lg para hacerlo más ancho */}
        <div
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 w-full max-w-lg bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b">
            <h2 className="text-lg font-semibold">{placeInfo.nombre}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="h-[calc(100%-56px)] overflow-y-auto">
            {/* Carrusel de imágenes */}
            <div className="w-full h-72 relative">
              {placeInfo.imagenes && placeInfo.imagenes.length > 0 ? (
                <>
                  <img
                    src={placeInfo.imagenes[currentImageIndex] || "/placeholder.svg"}
                    alt={`${placeInfo.nombre} - Imagen ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />

                  {/* Controles del carrusel */}
                  {placeInfo.imagenes.length > 1 && (
                    <>
                      {/* Botón anterior */}
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      {/* Botón siguiente */}
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      {/* Indicadores */}
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {placeInfo.imagenes.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToImage(index)}
                            className={`h-2 rounded-full transition-all ${currentImageIndex === index ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
                              }`}
                            aria-label={`Ir a imagen ${index + 1}`}
                          />
                        ))}
                      </div>

                      {/* Contador de imágenes */}
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                        {currentImageIndex + 1} / {placeInfo.imagenes.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">No hay imágenes disponibles</p>
                </div>
              )}
            </div>

            {/* Panel de indicaciones */}
            {showDirections && (
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-blue-800">Cómo llegar a {placeInfo.nombre}</h3>
                  <button
                    onClick={handleCloseDirections}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Cerrar panel de indicaciones"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="w-full flex items-center justify-between p-3 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center">
                      <Navigation className="h-5 w-5 text-blue-600 mr-2" />
                      <span>Tu ubicación actual</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-blue-400" />
                  </button>

                  <button
                    onClick={handleSelectOnMap}
                    disabled
                    className="w-full flex items-center justify-between p-3 bg-white border border-blue-200 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <Map className="h-5 w-5 text-blue-600 mr-2" />
                      <span>Elegir en el mapa (En desarrollo)</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-blue-400" />
                  </button>

                  {isLoadingLocation && (
                    <div className="text-center py-2">
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                      <span className="ml-2 text-sm text-blue-800">Obteniendo tu ubicación...</span>
                    </div>
                  )}

                  {directionsError && (
                    <div className="p-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded">
                      {directionsError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información principal */}
            <div className="p-6">
              <div className="flex items-center gap-1 mb-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-medium">{placeInfo.estrellas}</span>
                </div>
              </div>

              {placeInfo.horarios ? <div className="text-sm text-green-600 mb-3">{placeInfo.horarios}</div> : null}

              {/* Botones de acción */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <button
                  className="flex flex-col items-center justify-center py-2 px-1 border rounded-md hover:bg-gray-50"
                  onClick={handleDirectionsClick}
                >
                  <Car className="h-5 w-5 mb-1" />
                  <span className="text-xs">Indicaciones</span>
                </button>
                <button className="flex flex-col items-center justify-center py-2 px-1 border rounded-md hover:bg-gray-50">
                  <Phone className="h-5 w-5 mb-1" />
                  <span className="text-xs">Llamar</span>
                </button>
                <button className="flex flex-col items-center justify-center py-2 px-1 border rounded-md hover:bg-gray-50">
                  <Heart className="h-5 w-5 mb-1" />
                  <span className="text-xs">Guardar</span>
                </button>
                <button className="flex flex-col items-center justify-center py-2 px-1 border rounded-md hover:bg-gray-50">
                  <Share2 className="h-5 w-5 mb-1" />
                  <span className="text-xs">Compartir</span>
                </button>
              </div>

              <hr className="my-5" />

              {/* Dirección */}
              <div className="flex items-start gap-4 mb-5">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">{placeInfo.direccion}</p>
                </div>
              </div>

              {/* Horario */}
              <div className="flex items-start gap-4 mb-5">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                {placeInfo.horarios ? (
                  <div>
                    <p className="text-sm">{placeInfo.horarios}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm">No disponible</p>
                  </div>
                )}
              </div>

              {/* Sitio web */}
              <div className="flex items-start gap-4 mb-5">
                <ExternalLink className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                {placeInfo.contacto.sitio_Web ? (
                  <>
                    <div>
                      <p className="text-sm">{placeInfo.contacto.sitio_Web}</p>
                      <button className="text-sm text-blue-600 hover:underline">Visitar sitio web</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm">No disponible </p>
                    </div>
                  </>
                )}
              </div>

              <hr className="my-5" />

              {/* Descripción */}
              <div className="mb-5">
                <h3 className="font-medium mb-2">Acerca de este lugar</h3>
                <p className="text-sm text-gray-700">{placeInfo.tipo[1]}</p>
              </div>

              {/* Botón de reseñas */}
              <button onClick={handleClick} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Ir a {placeInfo.nombre}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return null // Retornar null mientras se carga la información
}
