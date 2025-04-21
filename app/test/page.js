"use client"

import { useState } from "react"
import SlideBar from "../components/SlideBar"
import { MapPin } from "lucide-react"

export default function MapPreview() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Datos de ejemplo para el lugar
    const placeData = {
        name: "Restaurante El Jardín",
        rating: 4.5,
        totalReviews: 128,
        address: "Av. Principal 123, Ciudad de México",
        description:
            "Restaurante con ambiente acogedor y comida deliciosa. Especialidad en platillos tradicionales mexicanos con un toque gourmet. Terraza al aire libre y música en vivo los fines de semana.",
        imageUrl: "/placeholder.svg?height=200&width=400",
        openHours: "Abierto ⋅ Cierra a las 22:00",
        priceLevel: "$$",
        website: "https://ejemplo.com",
        phoneNumber: "+52 55 1234 5678",
    }

    return (
        <div className="relative h-screen w-full bg-gray-100">
            {/* Simulación del mapa */}
            <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                <div className="text-center">
                    <MapPin className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="bg-white text-black hover:bg-gray-100 py-2 px-4 rounded-md shadow-md"
                    >
                        Ver detalles del lugar
                    </button>
                </div>
            </div>

            {/* Sidebar con información del lugar */}
            <SlideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} place={placeData} />
        </div>
    )
}
