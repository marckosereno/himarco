import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'himarco! - Tu Guía Turístico en Nuevo Progreso',
  description: 'Chatbot turístico inteligente para Nuevo Progreso, Tamaulipas, México. Descubre lugares, restaurantes, salud y más.',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  themeColor: '#3B82F6',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
<head>
  {/* 🔧 CONSOLA DE DEBUG TEMPORAL */}
  <Script 
    src="https://cdn.jsdelivr.net/npm/eruda"
    strategy="beforeInteractive"
  />
  <Script id="eruda-init" strategy="beforeInteractive">
    {`eruda.init();`}
  </Script>
  
  {/* Lottie Files Script */}
  <Script 
    src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js" 
    strategy="beforeInteractive"
  />
</head>

        {/* Lottie Files Script */}
        <Script 
          src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased">
        {children}
        
        {/* Google Maps API - Después del body */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`}
          strategy="lazyOnload"
        />
        
        {/* Marked.js - Después del body */}
        <Script 
          src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}