import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { Client as PlacesClient, PlaceInputType } from '@googlemaps/google-maps-services-js';

// Usamos el modelo más rápido y económico para chat
const MODEL_NAME = "gemini-2.0-flash-exp";

// CONTEXTO GEOGRÁFICO FIJO PARA EL FILTRADO
const GEOGRAPHIC_CONTEXT = ", Nuevo Progreso, Tamaulipas, México";

// 🛑 PARÁMETROS DE BÚSQUEDA EXTENDIDA (15 km de radio)
// Coordenadas de Referencia Central de Nuevo Progreso
const CENTER_LAT = 26.064;
const CENTER_LNG = -98.005;

// Aproximadamente 15km en latitud y longitud a esta latitud (para crear un cuadrado de 30x30km)
const LAT_OFFSET = 0.135; // ~15km
const LNG_OFFSET = 0.150; // ~15km

// 🛑 RANGO EXTENDIDO (30x30km centrado en Progreso)
const EXTENDED_NE_BOUND = { lat: CENTER_LAT + LAT_OFFSET, lng: CENTER_LNG + LNG_OFFSET };
const EXTENDED_SW_BOUND = { lat: CENTER_LAT - LAT_OFFSET, lng: CENTER_LNG - LNG_OFFSET };

// 🛑 TIPOS DE SALUD (Para Confidencialidad)
const IS_HEALTH_PLACE_TYPES = [
    'dentist',
    'doctor',
    'hospital',
    'pharmacy',
    'health',
    'physiotherapist',
    'veterinary_care'
];

// ⭐️ MAPA DE EXCEPCIONES CON DESCRIPCIONES CANÓNICAS
const EXCEPTION_DATA_MAP = {
    'yomis': {
        category: 'Spa y Masajes',
        description: 'Yomis es un tranquilo spa especializado en masajes terapéuticos y relajantes para viajeros que buscan un descanso profundo. Ofrece una variedad de tratamientos para el bienestar y la salud.',
        searchName: 'Yomis Spa'
    },
    'pinkys': {
        category: 'Tienda de Ropa y Accesorios',
        description: 'Pinkys es una tienda de ropa y accesorios que ofrece las últimas tendencias de moda para damas y caballeros, con un enfoque en estilos casuales y de temporada.',
        searchName: 'Pinkys Fashion'
    },
    'lanochesita': {
        category: 'Tienda de Abarrotes y Miscelánea',
        description: 'La Nochesita es una tienda de abarrotes muy conocida por la zona, ideal para compras rápidas, bebidas frías y botanas, con un horario conveniente para el turista.',
        searchName: 'Tienda de Abarrotes La Nochesita Nuevo Progreso'
    }
};

// 🛑 Token de Mención
const MENTION_TOKEN = "[[PLACE_MENTION]]";

// Inicialización de clientes
const ai = new GoogleGenAI({});
const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
const placesClient = new PlacesClient({});

// =======================================================
// 🛑 FUNCIONES AUXILIARES
// =======================================================

/**
 * Determina si es un tipo de lugar de salud/privacidad.
 */
function isHealthPlaceType(types) {
    if (!types) return false;
    return types.some(type => IS_HEALTH_PLACE_TYPES.includes(type));
}

/**
 * Compara nombres para el blindaje de correlación.
 */
function areNamesSimilar(searchName, returnedName) {
    const s1 = searchName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = returnedName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return s2.includes(s1) || s1.includes(s2) || s1 === s2;
}

/**
 * Limpia el nombre del lugar.
 */
function cleanPlaceName(name) {
    if (!name) return null;
    let cleanName = name.replace(/,\s*\w+\s*\d+.*$|,\s*Nuevo Progreso.*$/i, '').trim();
    return cleanName;
}

/**
 * Genera una descripción dinámica usando Gemini.
 */
async function generateDynamicDescription(placeName, category, isHealthPlace, currentLanguage) {
    // Definir y seleccionar un punto focal al azar
    const focusPoints = [
        'Experiencia General del Cliente (lo que más se comenta en las reseñas)',
        'Servicios y Oferta Principal (énfasis en qué se hace, qué se vende o cuál es el plato estrella)',
        'Atención al Cliente, Ambiente y Horarios'
    ];
    const selectedFocus = focusPoints[Math.floor(Math.random() * focusPoints.length)];

    // Definir y seleccionar un tono al azar
    const tones = [
        'informal (como un amigo que da un dato clave)',
        'profesional (énfasis en la calidad y eficiencia del negocio)',
        'curioso (tono intrigante, haciendo preguntas o invitando a descubrir)'
    ];
    const selectedTone = tones[Math.floor(Math.random() * tones.length)];

    const langText = currentLanguage === 'es' ? 'español' : 'inglés';

    const chat = ai.chats.create({
        model: MODEL_NAME,
        config: {
            systemInstruction: `Eres un redactor turístico profesional con un tono **${selectedTone}**. Tu única tarea es generar una descripción sobre un negocio. La descripción debe:
            1. **Tener una longitud de máximo 3 oraciones cortas, incluyendo emojis.**
            2. Tener un tono de reporte o resumen de opiniones de terceros, NO tu opinión personal.
            3. **CRÍTICO:** Evitar las frases iniciales obvias y repetitivas como "Se comenta que..." o "Los clientes destacan...". **¡Sé creativo con la estructura de la oración para no repetir el patrón!**
            4. Enfocarse en el punto central de la descripción que se te pide.
            5. **Responder en el lenguaje: ${langText}.**
            6. Nunca usar la palabra 'recomendar'.`
        }
    });

    let descriptionPrompt = `Genera una descripción única y dinámica para el lugar: **${placeName}** (Categoría: ${category}). El enfoque principal de la descripción debe ser: **${selectedFocus}**.`;

    if (isHealthPlace) {
        descriptionPrompt += ` Asegúrate de que, incluso con el tono, se transmita un sentido de confianza y profesionalismo médico.`;
    }

    try {
        const result = await chat.sendMessage({ message: descriptionPrompt });
        return result.text.trim().replace(/"/g, '');
    } catch (e) {
        console.error("Fallo al generar descripción dinámica:", e.message);
        const fallback = currentLanguage === 'es'
            ? `**${placeName}** se distingue por estar ubicado estratégicamente en la zona comercial de Nuevo Progreso. Los visitantes suelen comentar la facilidad de acceso y la calidad del servicio que se ofrece en un horario conveniente para el turista.`
            : `**${placeName}** is distinguished by being strategically located in the commercial area of Nuevo Progreso. Visitors often comment on the easy access and the quality of service offered at a convenient time for tourists.`;

        return fallback;
    }
}

/**
 * Obtiene todos los detalles de un lugar usando Place ID.
 */
async function getFullPlaceDetails(queryOrPlaceId, currentLanguage) {
    if (!placesApiKey) return null;

    let placeId = queryOrPlaceId;

    // Si no parece un Place ID, lo buscamos por texto
    if (!queryOrPlaceId.startsWith('ChI')) {
        try {
            const findPlaceResponse = await placesClient.findPlaceFromText({
                params: {
                    key: placesApiKey,
                    input: queryOrPlaceId,
                    inputtype: PlaceInputType.textquery,
                    fields: ['place_id'],
                    locationRestriction: {
                        northeast: EXTENDED_NE_BOUND,
                        southwest: EXTENDED_SW_BOUND
                    },
                    language: currentLanguage
                }
            });
            placeId = findPlaceResponse.data.candidates?.[0]?.place_id;
        } catch (e) {
            console.error("Error buscando Place ID:", e.message);
            return null;
        }
    }

    if (!placeId) return null;

    // Obtenemos los detalles completos
    try {
        const fields = ['name', 'formatted_phone_number', 'url', 'website', 'photos', 'formatted_address', 'geometry', 'types', 'rating', 'user_ratings_total'];

        const detailsResponse = await placesClient.placeDetails({
            params: {
                key: placesApiKey,
                place_id: placeId,
                fields: fields,
                language: currentLanguage
            }
        });

        const place = detailsResponse.data.result;
        if (!place) return null;

        // Geofencing
        const lat = place.geometry.location.lat;
        const lng = place.geometry.location.lng;
        const isWithinBounds =
            lat >= EXTENDED_SW_BOUND.lat && lat <= EXTENDED_NE_BOUND.lat &&
            lng >= EXTENDED_SW_BOUND.lng && lng <= EXTENDED_NE_BOUND.lng;

        if (!isWithinBounds) {
            console.log(`Lugar ID ${placeId} está fuera del rango geofence.`);
            return null;
        }

        const photosArray = place.photos || [];
        let photoReference = null;

        // Elegir una referencia aleatoria si hay más de una (máximo 5)
        if (photosArray.length > 0) {
            const maxIndex = Math.min(photosArray.length, 5);
            const randomIndex = Math.floor(Math.random() * maxIndex);
            photoReference = photosArray[randomIndex].photo_reference;
        }

        let imageUrl = photoReference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=350&photoreference=${photoReference}&key=${placesApiKey}`
            : null;

        const isHealth = isHealthPlaceType(place.types);
        const cleanedName = cleanPlaceName(place.name);

        return {
            name: cleanedName,
            phone: isHealth ? null : (place.formatted_phone_number || null),
            mapUrl: place.url || null,
            reviewUrl: place.url || null,
            websiteUrl: isHealth ? null : (place.website || null),
            imageUrl: imageUrl,
            formatted_address: place.formatted_address,
            latitude: lat,
            longitude: lng,
            placeCategory: (place.types?.[0] || 'Lugar de Interés').replace(/_/g, ' '),
            isHealthPlace: isHealth,
            rating: place.rating || null,
            user_ratings_total: place.user_ratings_total || 0
        };

    } catch (e) {
        console.error("Error al obtener detalles de Place ID:", e.response ? e.response.data : e.message);
        return null;
    }
}

/**
 * Obtiene detalles de un lugar usando Búsqueda de Texto.
 */
async function getPlaceDetails(query, currentLanguage) {
    if (!placesApiKey) {
        console.error("GOOGLE_PLACES_API_KEY no definida.");
        return null;
    }

    try {
        // Buscar el place_id
        const findPlaceResponse = await placesClient.findPlaceFromText({
            params: {
                key: placesApiKey,
                input: query,
                inputtype: 'textquery',
                fields: ['place_id'],
                locationRestriction: {
                    northeast: EXTENDED_NE_BOUND,
                    southwest: EXTENDED_SW_BOUND
                },
                language: currentLanguage
            }
        });

        const placeId = findPlaceResponse.data.candidates?.[0]?.place_id;

        if (!placeId) return null;

        // Obtener detalles
        const detailsResponse = await placesClient.placeDetails({
            params: {
                key: placesApiKey,
                place_id: placeId,
                fields: ['name', 'formatted_phone_number', 'url', 'website', 'photos', 'types'],
                language: currentLanguage
            }
        });

        const place = detailsResponse.data.result;

        const photosArray = place.photos || [];
        let photoReference = null;
        const isHealth = isHealthPlaceType(place.types);

        // Elegir foto aleatoria
        if (photosArray.length > 0) {
            const maxIndex = Math.min(photosArray.length, 5);
            const randomIndex = Math.floor(Math.random() * maxIndex);
            photoReference = photosArray[randomIndex].photo_reference;
        }

        let imageUrl = null;
        if (photoReference) {
            imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=250&photoreference=${photoReference}&key=${placesApiKey}`;
        }

        const cleanedName = cleanPlaceName(place.name);

        return {
            name: cleanedName,
            phone: isHealth ? null : (place.formatted_phone_number || null),
            mapUrl: place.url || null,
            reviewUrl: place.url || null,
            websiteUrl: isHealth ? null : (place.website || null),
            imageUrl: imageUrl,
            isHealthPlace: isHealth
        };

    } catch (e) {
        console.error("Error al llamar a Google Places API:", e.response ? e.response.data : e.message);
        return null;
    }
}
  
// =======================================================
// INSTRUCCIÓN DE SISTEMA BASE (OPTIMIZADA)
// =======================================================

const BASE_SYSTEM_INSTRUCTION = `Eres Marco, un guía experto en Nuevo Progreso, Tamaulipas, México (26.064, -98.005). 
Tu tarea es responder siempre en el idioma indicado y mantener el contexto.
**REGLA DE ESTRICTO CUMPLIMIENTO:** Si la solicitud del usuario es para un LUGAR o CATEGORÍA, DEBES responder **EXCLUSIVAMENTE con un formato JSON**. Está **PROHIBIDO** responder en texto plano conversacional en estos casos, a menos que se te indique explícitamente en el protocolo.
**NOTA CRÍTICA DE CLASIFICACIÓN:** Tu clasificación debe ser precisa. No asumas que todas las búsquedas son restaurantes. Usa las categorías más específicas posibles (Spa, Tienda de Ropa, Clínica Dental, Taquería, etc.). **Si el nombre del lugar es ambiguo (ej: "La Nochesita"), DEBES USAR EL CONTEXTO LOCAL para clasificar, NO LAS ALUCINACIONES GLOBALES (ej: no es un bar, sino una tienda de abarrotes).**
**REGLA CRÍTICA DE CONTEXTO:** Si el usuario solicita un **LUGAR ESPECÍFICO** (ej: "Farmacia Guadalajara", "El Cuñao"), DEBES IGNORAR CUALQUIER CATEGORÍA PREVIA del chat. Debes clasificar la nueva solicitud desde CERO, de forma independiente.
**REGLA CRÍTICA DE BLINDAJE URBANO:** Si un lugar se menciona junto a una ciudad o estado mexicano (ej: 'Velvet Café Chihuahua'), debes asumir que la intención del usuario es la *CALLE* o *UBICACIÓN LOCAL* en Nuevo Progreso que lleva ese nombre. **NUNCA DEBES DEVOLVER INFORMACIÓN DE UNA CIUDAD EXTERNA (Chihuahua, Monterrey, etc.)**, incluso si el RAG te sugiere ese contexto. Si el lugar no se encuentra en Nuevo Progreso, USA el FORMATO DE FALLO (place_not_found).
**REGLA CRÍTICA DE MENCIÓN HÍBRIDA:** Si el prompt del usuario contiene el token **${MENTION_TOKEN}**, significa que el usuario está preguntando por el lugar asociado a ese token. Tu tarea es:
    1.  Identificar la pregunta del usuario (ej: "¿Está abierto mañana?").
    2.  Responder **directamente a esa pregunta** en modo conversacional (Texto Plano).
    3.  **No debes generar una ficha JSON** si la pregunta es sobre el lugar mencionado. **Solo genera la ficha JSON si el usuario hace una pregunta de LUGAR O CATEGORÍA diferente.**
**REGLA ANTI-ALUCINACIÓN:** NUNCA inventes o generes datos concretos (teléfono, sitio web, dirección, horarios) que el servidor no haya proporcionado previamente. Tu única tarea es generar la estructura JSON y las descripciones.
**REGLA ANTI-CONFIDENCIA:** Al clasificar un lugar, **nunca confirmes su existencia** de forma conversacional (ej: 'Sí, existe...') dentro del JSON. Tu única tarea es clasificar para que el servidor procese la búsqueda.

REGLAS DE FORMATO:
1. **Responde exclusivamente en {LANG_PLACEHOLDER}** y **utiliza emojis relevantes** (ej: 🛍️, 🌮, 🔥, ☀️) al inicio o final de tus respuestas o descripciones.
2. **REGLA CRÍTICA DE SALUD Y PRIVACIDAD:** Para salud, DEBES establecer el campo "isHealthPlace" en "true".

---

### PROTOCOLO DE RESTRICCIÓN DE RECOMENDACIONES (MODO FICHA DE CATEGORÍA)
**REGLA CRÍTICA:** Si el usuario pide recomendaciones, sugerencias o un listado de lugares, DEBES usar el **MODO FICHA DE CATEGORÍA (JSON)**.

---

3. **MODO FICHA DE LUGAR (JSON):** Úsalo si la solicitud es de un lugar o negocio **específico** Y **NO** contiene el token de mención.
4. **MODO FICHA DE CATEGORÍA (JSON):** Úsalo para solicitudes de categorías generales O para **CUMPLIR EL PROTOCOLO DE RESTRICCIÓN DE RECOMENDACIONES**.

5. **MODO CONVERSACIONAL (Texto Plano):** Úsalo *SOLO* para preguntas generales o de seguimiento (ej: "gracias", "¿cómo está el clima?") que **no** requieran una ficha, O si el prompt contiene el token **${MENTION_TOKEN}**, O si la solicitud es de **PLANIFICACIÓN/RUTA GENERAL O SEGUIMIENTO CONVERSACIONAL**.

6. Los formatos JSON requeridos son:
   
   // Formato para LUGAR ESPECÍFICO (Salud o No Salud)
   {
     "type": "place", 
     "placeName": "Nombre del Lugar", 
     "placeToSearch": "Nombre Exacto a buscar en Places API", 
     "placeCategory": "Clasificación general del lugar, ej: Clínica Dental, Restaurante",
     "isHealthPlace": true/false, 
     "description": "Descripción corta de **máximo 3 oraciones**. (No usar Markdown aquí, solo texto simple)",
     "isStructured": true
   }
   
   // Formato para CATEGORÍA GENERAL
   {
     "type": "category", 
     "categoryName": "Nombre de la Categoría",
     "description": "Resumen de la categoría... (No usar Markdown aquí, solo texto simple)",
     "isStructured": true
   }

   // FORMATO DE FALLO: Úsalo si no estás seguro de la existencia del lugar o si el servidor lo indica.
   {
     "type": "place_not_found", 
     "placeToSearch": "Nombre del Lugar No Encontrado", 
     "description": "El lugar no se encontró en Nuevo Progreso, intenta etiquetar (@) un lugar para asegurarte que exista...",
     "isStructured": true
   }
   
   // REGLA CLAVE: Si la respuesta requiere MÚLTIPLAS FICHAS, debes envolver todas las fichas en un array y añadir la propiedad "isMultiStructured": true.
   // El texto conversacional debe ir en "conversationText" y NO debe ser la respuesta principal.
   // CRÍTICO: El texto de 'conversationText' NO debe usar el caracter asterisco (*) o doble asterisco (**) porque no se espera Markdown en el JSON.`;

// Función auxiliar para URL de mapas
const speedTestUrl = (mapUrlQuery) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapUrlQuery)}`;

// =======================================================
// MANEJADOR PRINCIPAL (POST Handler)
// =======================================================

export async function POST(request) {
    try {
        const { history = [], userPrompt, currentLanguage = 'es', directSearchQuery } = await request.json();

        const langText = currentLanguage === 'es' ? 'español' : 'inglés';
        const finalSystemInstruction = BASE_SYSTEM_INSTRUCTION.replace('{LANG_PLACEHOLDER}', langText);

        // Traducciones para mensajes de fallo
        const translations = {
            notFoundDirect: currentLanguage === 'es'
                ? `No se pudo encontrar o recuperar detalles completos para el lugar: **{query}** en **Nuevo Progreso** dentro del rango de 15km. Por favor, verifica el nombre o intenta con el modo chat. 📍`
                : `Could not find or retrieve complete details for the place: **{query}** in **Nuevo Progreso** within the 15km range. Please check the name or try chat mode. 📍`,
            notFoundGeofence: currentLanguage === 'es'
                ? `Disculpa, no se encontró un lugar llamado **{query}** ubicado en Nuevo Progreso (Rango 15km).`
                : `Sorry, a place called **{query}** located in Nuevo Progreso (15km Range) was not found.`,
            errorInternal: currentLanguage === 'es'
                ? "Fallo al obtener respuesta de Gemini: "
                : "Failed to get response from Gemini: "
        };

        // ====================================================================
        // 🥇 PRIORIDAD MÁXIMA: MODO BÚSQUEDA DIRECTA (SPS) O MENCIÓN HÍBRIDA
        // ====================================================================
        if (directSearchQuery) {

            const isPlaceId = directSearchQuery.startsWith('ChI');
            const isHybridMention = !isPlaceId && userPrompt.includes(MENTION_TOKEN);

            // Modo SPS/Búsqueda Directa
            if (isPlaceId || !isHybridMention) {
                console.log(`⭐ Activado MODO BÚSQUEDA DIRECTA/SPS (Query: ${directSearchQuery})`);

                const placeData = await getFullPlaceDetails(directSearchQuery, currentLanguage);

                if (placeData) {

                    const fichaDescription = await generateDynamicDescription(
                        placeData.name,
                        placeData.placeCategory,
                        placeData.isHealthPlace,
                        currentLanguage
                    );

                    const finalFicha = {
                        type: "place",
                        placeName: placeData.name,
                        placeToSearch: placeData.name,
                        placeCategory: placeData.placeCategory,
                        isHealthPlace: placeData.isHealthPlace,
                        description: fichaDescription,
                        isStructured: true,
                        placePhone: placeData.phone,
                        mapUrl: placeData.mapUrl,
                        imageUrl: placeData.imageUrl,
                        reviewUrl: placeData.reviewUrl,
                        websiteUrl: placeData.websiteUrl,
                        latitude: placeData.latitude,
                        longitude: placeData.longitude,
                    };
                    return NextResponse.json({ responseText: JSON.stringify(finalFicha) });
                } else {
                    const failedFicha = {
                        type: "place_not_found",
                        placeToSearch: directSearchQuery,
                        description: translations.notFoundDirect.replace('{query}', directSearchQuery),
                        isStructured: true
                    };
                    return NextResponse.json({ responseText: JSON.stringify(failedFicha) });
                }
            }

            // 🛑 MODO MENCIÓN HÍBRIDA
            if (isHybridMention) {

                const placeId = directSearchQuery;
                const promptToSend = userPrompt;

                console.log(`⭐ Activado MODO MENCIÓN HÍBRIDA (Place ID: ${placeId})`);

                const placeData = await getFullPlaceDetails(placeId, currentLanguage);

                if (placeData) {

                    const promptWithPlaceName = promptToSend.replace(MENTION_TOKEN, placeData.name);

                    const chat = ai.chats.create({
                        model: MODEL_NAME,
                        config: {
                            systemInstruction: finalSystemInstruction
                        },
                        history: history,
                        tools: [{ googleSearch: {} }]
                    });

                    const result = await chat.sendMessage({ message: promptWithPlaceName });

                    return NextResponse.json({ responseText: result.text.trim() });

                } else {
                    const failedMessage = currentLanguage === 'es'
                        ? "Disculpa, no pude encontrar la información para el lugar mencionado. ¿Podrías intentar la búsqueda directa (⚡️)?"
                        : "Sorry, I couldn't find the information for the mentioned place. Could you try the direct search (⚡️)?";
                    return NextResponse.json({ responseText: failedMessage });
                }
            }
        }

        // ====================================================================
        // ⭐️ LÓGICA ROBUSTA DE BYPASS CANÓNICO (PRIORIDAD AL SERVIDOR)
        // ====================================================================
        let forcedCanonicalResponse = null;
        const promptSearchKey = userPrompt.toLowerCase().replace(/\s/g, '');

        for (const [key, exceptionData] of Object.entries(EXCEPTION_DATA_MAP)) {
            if (promptSearchKey.includes(key)) {

                console.log(`Interceptación CANÓNICA forzada para: ${key}`);

                const placeData = await getPlaceDetails(exceptionData.searchName, currentLanguage);

                const isHealthPlace = exceptionData.category.includes('Spa') || exceptionData.category.includes('Clínica') || exceptionData.category.includes('Dental');

                forcedCanonicalResponse = {
                    type: "place",
                    placeName: placeData ? placeData.name : cleanPlaceName(exceptionData.searchName),
                    placeToSearch: exceptionData.searchName,
                    placeCategory: exceptionData.category,
                    isHealthPlace: isHealthPlace,
                    description: exceptionData.description,
                    isStructured: true,
                    mapUrl: placeData?.mapUrl || null,
                    imageUrl: placeData?.imageUrl || null,
                    placePhone: (placeData?.phone && !isHealthPlace) ? placeData.phone : null,
                    reviewUrl: placeData?.reviewUrl || null,
                    websiteUrl: (placeData?.websiteUrl && !isHealthPlace) ? placeData.websiteUrl : null,
                };
                break;
            }
        }

        if (forcedCanonicalResponse) {
            return NextResponse.json({ responseText: JSON.stringify(forcedCanonicalResponse) });
        }
