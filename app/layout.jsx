import './globals.css'

export const metadata = {
  title: 'himarco! - Tu Guía Turístico en Nuevo Progreso',
  description: 'Chatbot turístico inteligente para Nuevo Progreso, Tamaulipas, México. Descubre lugares, restaurantes, salud y más.',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  themeColor: '#3B82F6',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Google Maps API Script */}
        <script
          async
          defer
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`}
        />
        
        {/* Lottie Files Script (para animaciones si las usas) */}
        <script 
          src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js" 
          type="module"
        />
        
        {/* Marked.js para Markdown */}
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
