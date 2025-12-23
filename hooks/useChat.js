'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Constantes
const BACKEND_URL = "/api/chat"
const MAX_CHAT_RESULTS = 4
const MENTION_TOKEN = "[[PLACE_MENTION]]"

// Textos de UI por idioma
const UI_STRINGS = {
    es: {
        header: "Hi Marco!",
        placeholder: "Pregúntale a Marco",
        searchPlaceholder: "Nombre del lugar o negocio...",
        goButton: "Enviar",
        loadingStatus: "Respondiendo tu petición...",
        categories: "✨️ Categorías",
        language: "🧢 Idioma",
        getThere: "🚀 Cómo Llegar",
        info: "ℹ️ Info",
        alertStructured: (name) => `¡Ficha verificada de ${name}!`,
        alertCategory: (name) => `Resumen de la categoría ${name}.`,
        chipHealth: "🏥 Salud & Estética",
        chipShopping: "🛍️ Compras",
        chipEntertainment: "🎺 Entretenimiento",
        chipRestaurant: "🍽 Restaurantes",
        btnMap: "Ver en el Mapa 🧭",
        btnSearch: "Resultados en Google 🔍",
        btnPhone: "Llamar Ahora 📞",
        btnReview: "Reseñas ⭐",
        btnWebsite: "Sitio Web/Redes 🌐",
        spsMode: "Modo Pro ●Activado 🦾",
        chatMode: "Modo Chat 💬",
        mentionPlaceholder: (name) => `Conversando sobre ${name}...`
    },
    en: {
        header: "PROGRESO TOUR GUIDE",
        placeholder: "Ask the map",
        searchPlaceholder: "Enter the business name...",
        goButton: "Send",
        loadingStatus: "Processing your request...",
        categories: "✨️ Categories",
        language: "🧢 Language",
        getThere: "🚀 How to get there",
        info: "ℹ️ Info",
        alertStructured: (name) => `Verified card for ${name}!`,
        alertCategory: (name) => `Summary for ${name} category.`,
        chipHealth: "🏥 Health & Beauty",
        chipShopping: "🛍️ Shopping",
        chipEntertainment: "🎺 Entertainment",
        chipRestaurant: "🍽 Restaurants",
        btnMap: "View on Map 🧭",
        btnSearch: "Search Results on Google 🔍",
        btnPhone: "Call Now 📞",
        btnReview: "Reviews ⭐",
        btnWebsite: "Website/Social 🌐",
        spsMode: "Pro Mode ●Active 🦾",
        chatMode: "Chat Mode 💬",
        mentionPlaceholder: (name) => `Conversing about ${name}...`
    }
}

// Mapa de subcategorías
const SUBCATEGORIES_MAP = {
    "Dime sobre la Categoría Salud y Estética en Progreso": [
        { label: "Dentistas 🦷", query: "Mejores dentistas en Progreso" },
        { label: "Ópticas 👓", query: "Ópticas y lentes de contacto en Progreso" },
        { label: "Farmacias 💊", query: "Farmacias con medicamento de patente en Progreso" },
        { label: "Clínicas y Doctores 👨‍⚕️", query: "Clínicas y doctores en Progreso" },
        { label: "Cirugía Estética ✨", query: "Cirujanos plásticos y estética en Progreso" },
        { label: "Laboratorios 🧪", query: "Laboratorios de análisis clínicos en Progreso" },
        { label: "Veterinarios 🐶", query: "Veterinarias en Progreso" },
        { label: "Todos de Salud 🧭", query: "Todos los lugares de salud y estética en Progreso" }
    ],
    "Dime sobre la Categoría Compras y Tiendas en Progreso": [
        { label: "Ropa y Moda 👕", query: "Tiendas de ropa y moda en Progreso" },
        { label: "Artesanías 🎁", query: "Artesanías y souvenirs en Progreso" },
        { label: "Vinos y Licores 🍾", query: "Tiendas de vinos y licores en Progreso" },
        { label: "Joyería y Regalos 💍", query: "Joyerías y tiendas de regalos en Progreso" },
        { label: "Todos de Compras 🛍️", query: "Todos los lugares de compras y tiendas en Progreso" }
    ],
    "Dime sobre la Categoría Entretenimiento y Atracciones en Progreso": [
        { label: "Atracciones 🎡", query: "Atracciones turísticas en Progreso" },
        { label: "Bares y Cantinas 🍺", query: "Bares y cantinas en Progreso" },
        { label: "Hoteles y Hospedaje 🏨", query: "Hoteles y hospedaje en Progreso" },
        { label: "Eventos y Fiestas 🎉", query: "Próximos eventos y fiestas en Progreso" }
    ],
    "Cuentame sobre la Categoría de Restaurantes": [
        { label: "Comida Mexicana 🇲🇽", query: "Restaurantes de comida tradicional mexicana en Progreso" },
        { label: "Tacos y Lonches 🌮", query: "Tacos, lonches y comida rápida popular en Progreso" },
        { label: "Mariscos y Pescado 🎣", query: "Mejores restaurantes de mariscos y pescado en Progreso" },
        { label: "Bares y Cervecerías 🍻", query: "Bares, cervecerías y lugares para tomar tragos en Progreso" },
        { label: "Postres y Cafeterías ☕", query: "Cafeterías, panaderías y lugares de postres en Progreso" },
        { label: "Comida Rápida Americana 🍔", query: "Comida rápida y hamburguesas estilo americano en Progreso" },
        { label: "Todos los Restaurantes 🍽️", query: "Todos los restaurantes y lugares de comida en Progreso" }
    ]
}

// Mensajes de agradecimiento aleatorios para Buy Me a Coffee
const THANK_YOU_MESSAGES = [
    "¡Wow! Muchas gracias por querer apoyarme con un cafecito ☕ ¡Eres increíble! 😊",
    "¡Qué lindo gesto! Gracias de corazón por pensar en invitarme un café ❤️",
    "¡No sabes cuánto me alegra tu intención! Gracias por querer darme un cafecito 🥰",
    "¡Eres un sol! Muchísimas gracias por esa buena vibra y por querer pagarme un café 🌟",
    "¡Gracias infinitas! Tu apoyo significa mucho para mí ☕✨"
]

export function useChat() {
    // Estados principales
    const [chatHistory, setChatHistory] = useState([])
    const [currentLanguage, setCurrentLanguage] = useState('es')
    const [isBotTyping, setIsBotTyping] = useState(false)
    const [isUserTyping, setIsUserTyping] = useState(false)
    const [isSPSMode, setIsSPSMode] = useState(false)
    const [isMentionMode, setIsMentionMode] = useState(false)
    const [currentMentionPlace, setCurrentMentionPlace] = useState(null)
    
    // Estados de UI
    const [inputValue, setInputValue] = useState('')
    const [categoriesVisible, setCategoriesVisible] = useState(false)
    const [languageMenuVisible, setLanguageMenuVisible] = useState(false)
    const [dynamicChipsData, setDynamicChipsData] = useState([])
    const [showQuickActionFullList, setShowQuickActionFullList] = useState(false)
    const [lastTotalCount, setLastTotalCount] = useState(0)
    const [lastApiQuery, setLastApiQuery] = useState(null)

    // Refs
    const messageContainerRef = useRef(null)
    const inputRef = useRef(null)

    // ====================================================================
    // FUNCIONES DE PERSISTENCIA
    // ====================================================================

    const saveHistory = useCallback((history) => {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(history))
        } catch (e) {
            console.error("Error al guardar el historial", e)
        }
    }, [])

    const loadHistory = useCallback(() => {
        try {
            const savedHistory = localStorage.getItem('chatHistory')
            if (savedHistory) {
                const loadedHistory = JSON.parse(savedHistory)
                if (Array.isArray(loadedHistory) && loadedHistory.length > 0) {
                    setChatHistory(loadedHistory)
                    return true
                }
            }
        } catch (e) {
            console.error("Error al cargar el historial", e)
        }
        return false
    }, [])

    const clearChatHistory = useCallback(() => {
        setChatHistory([])
        localStorage.removeItem('chatHistory')
        setDynamicChipsData([])
        setShowQuickActionFullList(false)
        setLastTotalCount(0)
        setLastApiQuery(null)
        
        if (isSPSMode) {
            setIsSPSMode(false)
        }
        
        resetMentionMode()
        
        return currentLanguage === 'es' 
            ? '¡Conversación eliminada! Empecemos de cero. 👋' 
            : 'Conversation cleared! Let\'s start fresh. 👋'
    }, [currentLanguage, isSPSMode])

    // ====================================================================
    // FUNCIONES DE UTILIDAD
    // ====================================================================

    const formatTime = (date) => {
        if (!date) return ''
        let hours = date.getHours()
        const minutes = date.getMinutes()
        const ampm = hours >= 12 ? 'pm' : 'am'
        hours = hours % 12
        hours = hours ? hours : 12
        const minutesStr = minutes < 10 ? '0'+minutes : minutes
        return hours + ':' + minutesStr + ' ' + ampm
    }

    const scrollToBottom = useCallback(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
        }
    }, [])

    const isScrolledToBottom = useCallback(() => {
        if (!messageContainerRef.current) return true
        const scrollDifference = messageContainerRef.current.scrollHeight - messageContainerRef.current.scrollTop
        const viewportHeight = messageContainerRef.current.clientHeight
        return scrollDifference <= viewportHeight + 200
    }, [])

    const vibrateDevice = useCallback(() => {
        if ("vibrate" in navigator) {
            navigator.vibrate(100)
        }
    }, [])

    const resetMentionMode = useCallback(() => {
        setIsMentionMode(false)
        setCurrentMentionPlace(null)
    }, [])

    // ====================================================================
    // GESTIÓN DEL IDIOMA
    // ====================================================================

    const changeLanguage = useCallback((lang) => {
        setCurrentLanguage(lang)
        setLanguageMenuVisible(false)
        return `Interfaz y conversación cambiadas a ${lang === 'es' ? 'Español' : 'English'}`
    }, [])

    // ====================================================================
    // MODO SPS
    // ====================================================================

    const toggleSPSMode = useCallback(() => {
        setIsSPSMode(prev => !prev)
        setInputValue('')
        resetMentionMode()
    }, [resetMentionMode])

    // ====================================================================
    // ENVÍO DE MENSAJES
    // ====================================================================

    const handleSend = useCallback(async (userPromptInput = null, placeIdForDirectSearch = null) => {
        const isSPSorDirect = placeIdForDirectSearch !== null
        
        let userPrompt = userPromptInput || inputValue.trim()
        if (!userPrompt) return

        if (isSPSMode && !isSPSorDirect) return

        let placeIdForAPI = placeIdForDirectSearch

        // Manejo de @menciones
        if (currentMentionPlace && !isSPSorDirect) {
            placeIdForAPI = currentMentionPlace.placeId
            const mentionText = '@' + currentMentionPlace.textName
            const regex = new RegExp(mentionText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
            userPrompt = userPrompt.replace(regex, MENTION_TOKEN)
            resetMentionMode()
        }

        // Ocultar chips y menús
        setCategoriesVisible(false)
        setLanguageMenuVisible(false)
        setShowQuickActionFullList(false)
        setDynamicChipsData([])

        // Mostrar loading
        setIsBotTyping(true)

        // Añadir mensaje del usuario al historial
        if (!isSPSorDirect) {
            let userHistoryText = userPromptInput || inputValue
            if (placeIdForAPI && !isSPSorDirect) {
                userHistoryText = inputValue
            }

            const newUserMessage = { 
                role: 'user', 
                text: userHistoryText, 
                timestamp: new Date() 
            }

            setChatHistory(prev => {
                const updated = [...prev, newUserMessage]
                saveHistory(updated)
                return updated
            })
        }

        setInputValue('')

        // Preparar historial para enviar al backend
        const MAX_HISTORY_TO_SEND = 10
        const previousHistory = chatHistory.slice(0, -1)
        const startIndex = Math.max(0, previousHistory.length - MAX_HISTORY_TO_SEND)
        const limitedHistory = previousHistory.slice(startIndex)

        // Llamada al backend
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: limitedHistory,
                    userPrompt: userPrompt,
                    currentLanguage: currentLanguage,
                    directSearchQuery: placeIdForAPI
                })
            })

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`)
            }

            const data = await response.json()
            let modelResponseText = data.responseText

            setIsBotTyping(false)

            // Procesar respuesta
            processModelResponse(modelResponseText)

        } catch (error) {
            console.error("Error al llamar al backend:", error)
            setIsBotTyping(false)
            
            const errorMessage = {
                role: 'model',
                text: currentLanguage === 'es' 
                    ? 'Error de conexión. Por favor intenta de nuevo.' 
                    : 'Connection error. Please try again.',
                timestamp: new Date()
            }
            
            setChatHistory(prev => {
                const updated = [...prev, errorMessage]
                saveHistory(updated)
                return updated
            })
        }

    }, [inputValue, isSPSMode, currentMentionPlace, currentLanguage, chatHistory, resetMentionMode, saveHistory])

    // ====================================================================
    // PROCESAMIENTO DE RESPUESTA DEL MODELO
    // ====================================================================

    const processModelResponse = useCallback((modelResponseText) => {
        let finalMessage = { 
            role: 'model', 
            text: modelResponseText, 
            timestamp: new Date(), 
            isStructured: false 
        }

        let totalCount = 0
        let apiQuery = null
        let newDynamicChips = null

        try {
            const jsonStart = modelResponseText.indexOf('{')
            const jsonEnd = modelResponseText.lastIndexOf('}')

            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonString = modelResponseText.substring(jsonStart, jsonEnd + 1)
                const parsedJson = JSON.parse(jsonString)

                let fichasParaMostrar = []
                let conversationText = modelResponseText.replace(jsonString, '').trim()

                if (parsedJson.isMultiStructured === true && Array.isArray(parsedJson.response)) {
                    fichasParaMostrar = parsedJson.response
                    if (parsedJson.conversationText) conversationText = parsedJson.conversationText
                } else if (parsedJson.isStructured === true) {
                    fichasParaMostrar = [parsedJson]
                } else if (parsedJson.isLocalRecommendation === true) {
                    totalCount = parsedJson.totalCount || 0
                    apiQuery = parsedJson.apiQueryForChip || null
                    finalMessage.text = conversationText
                    if (finalMessage.text.length < 5) finalMessage.text = modelResponseText
                } else if (parsedJson.isDynamicChips === true) {
                    newDynamicChips = parsedJson.chips
                    finalMessage.text = conversationText
                    if (finalMessage.text.length < 5) finalMessage.text = modelResponseText
                }

                if (fichasParaMostrar.length > 0) {
                    if (conversationText.length > 0) {
                        setChatHistory(prev => {
                            const updated = [...prev, { 
                                role: 'model', 
                                text: conversationText, 
                                timestamp: new Date(), 
                                isStructured: false 
                            }]
                            saveHistory(updated)
                            return updated
                        })
                    }

                    fichasParaMostrar.forEach(ficha => {
                        setChatHistory(prev => {
                            const updated = [...prev, {
                                role: 'model',
                                isStructured: true,
                                type: ficha.type,
                                text: ficha.description || ficha.text,
                                placeName: ficha.placeName,
                                placePhone: ficha.placePhone || null,
                                mapUrl: ficha.mapUrl || null,
                                reviewUrl: ficha.reviewUrl || null,
                                websiteUrl: ficha.websiteUrl || null,
                                categoryName: ficha.categoryName || null,
                                isHealthPlace: ficha.isHealthPlace || false,
                                menuKey: ficha.menuKey || null,
                                imageUrl: ficha.imageUrl || null,
                                timestamp: new Date()
                            }]
                            saveHistory(updated)
                            return updated
                        })
                    })

                    return
                }
            }
        } catch (e) {
            console.error("Error al parsear JSON:", e)
            finalMessage.text = modelResponseText
        }

        // Añadir mensaje final
        setChatHistory(prev => {
            const updated = [...prev, finalMessage]
            saveHistory(updated)
            return updated
        })

        // Manejar chips dinámicos
        if (newDynamicChips && newDynamicChips.length > 0) {
            setDynamicChipsData(newDynamicChips)
            setShowQuickActionFullList(false)
        } else if (totalCount > MAX_CHAT_RESULTS && apiQuery) {
            setLastTotalCount(totalCount)
            setLastApiQuery(apiQuery)
            setShowQuickActionFullList(true)
        } else {
            setShowQuickActionFullList(false)
        }

    }, [saveHistory])

    // ====================================================================
    // BOTÓN DE APOYO (BUY ME A COFFEE)
    // ====================================================================

    const handleSupportClick = useCallback(() => {
        vibrateDevice()

        const randomMsg = THANK_YOU_MESSAGES[Math.floor(Math.random() * THANK_YOU_MESSAGES.length)]

        const supportMessage = {
            role: 'model',
            text: randomMsg,
            timestamp: new Date(),
            isStructured: true,
            type: 'support',
            actions: [
                { label: "☕ 1 café", url: "https://www.buymeacoffee.com/marckosereno?supporter_amount=3" },
                { label: "☕☕ 2 cafés", url: "https://www.buymeacoffee.com/marckosereno?supporter_amount=6" },
                { label: "☕☕☕ 3 cafés", url: "https://www.buymeacoffee.com/marckosereno?supporter_amount=9" }
            ]
        }

        setChatHistory(prev => {
            const updated = [...prev, supportMessage]
            saveHistory(updated)
            return updated
        })

        scrollToBottom()
    }, [vibrateDevice, saveHistory, scrollToBottom])

    // ====================================================================
    // EFECTOS
    // ====================================================================

    // Cargar historial al montar
    useEffect(() => {
        const loaded = loadHistory()
        if (!loaded) {
            const welcomeMessage = currentLanguage === 'es'
                ? "¡Hola! Soy Marco! 👋 tu guía turístico local, listo para acompañarte en cada paso. Utiliza el chip Modo Chat 💬 para conversar normalmente o tócalo para usar la potente Búsqueda Geográfica Directa 🔥 y encontrar lo que buscas al instante."
                : "Hi! I am your trusted tour guide, ready to accompany you at every step. Activate the Chat Mode chip 💬 to chat normally or touch it to use the powerful Direct Geographic Search (SPS) ⚡️ and find what you are looking for instantly."

            setChatHistory([{ 
                role: 'model', 
                text: welcomeMessage, 
                timestamp: new Date(), 
                isStructured: false 
            }])
        }
    }, [loadHistory, currentLanguage])

    // Scroll al fondo cuando cambia el historial
    useEffect(() => {
        scrollToBottom()
    }, [chatHistory, scrollToBottom])

    // ====================================================================
    // RETURN
    // ====================================================================

    return {
        // Estados
        chatHistory,
        currentLanguage,
        isBotTyping,
        isUserTyping,
        isSPSMode,
        isMentionMode,
        currentMentionPlace,
        inputValue,
        categoriesVisible,
        languageMenuVisible,
        dynamicChipsData,
        showQuickActionFullList,
        lastTotalCount,
        lastApiQuery,
        
        // Setters
        setIsUserTyping,
        setInputValue,
        setCategoriesVisible,
        setLanguageMenuVisible,
        setCurrentMentionPlace,
        setIsMentionMode,
        
        // Funciones
        handleSend,
        clearChatHistory,
        changeLanguage,
        toggleSPSMode,
        handleSupportClick,
        formatTime,
        scrollToBottom,
        vibrateDevice,
        resetMentionMode,
        isScrolledToBottom,
        
        // Refs
        messageContainerRef,
        inputRef,
        
        // Constantes
        UI_STRINGS,
        SUBCATEGORIES_MAP,
        MENTION_TOKEN
    }
}
