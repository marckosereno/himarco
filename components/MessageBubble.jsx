'use client'

import { useEffect, useRef } from 'react'

export default function MessageBubble({ 
    message, 
    currentLanguage, 
    formatTime, 
    onActionClick,
    subcategoriesMap,
    uiStrings 
}) {
    const bubbleRef = useRef(null)

    // Procesar markdown usando marked.js
    useEffect(() => {
        if (typeof window !== 'undefined' && window.marked && bubbleRef.current) {
            const markdownElements = bubbleRef.current.querySelectorAll('.markdown-content')
            markdownElements.forEach(el => {
                const rawText = el.getAttribute('data-raw-text')
                if (rawText) {
                    el.innerHTML = window.marked.parse(rawText)
                }
            })
        }
    }, [message])

    const timeStr = message.timestamp ? formatTime(message.timestamp) : ''
    const strings = uiStrings[currentLanguage]

    // ====================================================================
    // BURBUJA DE USUARIO
    // ====================================================================

    if (message.role === 'user') {
        return (
            <div className="flex justify-end mb-2" ref={bubbleRef}>
                <div className="flex flex-col items-end">
                    <div className="user-bubble bg-black text-white p-3 shadow-md">
                        <div className="markdown-content" data-raw-text={message.text}></div>
                    </div>
                    {timeStr && (
                        <div className="user-timestamp-container">
                            <span className="timestamp">{timeStr}</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ====================================================================
    // BURBUJA DEL MODELO (NO ESTRUCTURADA)
    // ====================================================================

    if (message.role === 'model' && !message.isStructured) {
        return (
            <div className="flex flex-col justify-start w-full mb-2" ref={bubbleRef}>
                <div className="flex flex-col items-start">
                    <div className="model-bubble-wrapper p-3 pb-4 shadow-md">
                        <div className="markdown-content" data-raw-text={message.text}></div>
                    </div>
                    {timeStr && (
                        <div className="model-timestamp-container">
                            <span className="timestamp">{timeStr}</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ====================================================================
    // BURBUJA DEL MODELO (ESTRUCTURADA)
    // ====================================================================

    if (message.role === 'model' && message.isStructured) {
        const isPlaceOrCategory = (message.type === 'place' || message.type === 'category')
        const isSupport = message.type === 'support'
        const hasSubMenu = message.menuKey && subcategoriesMap[message.menuKey]

        let imageHTML = null
        if (isPlaceOrCategory && message.imageUrl) {
            imageHTML = (
                <a
                    href={message.mapUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="image-link"
                    onClick={(e) => {
                        if (!message.mapUrl) e.preventDefault()
                    }}
                >
                    <img
                        src={message.imageUrl}
                        className="stacked-photo clickable-effect"
                        alt={`Imagen del lugar ${message.placeName || message.categoryName || ''}`}
                        loading="lazy"
                    />
                </a>
            )
        }

        // ACCIONES PARA SOPORTE (BUY ME A COFFEE)
        let actionsBar = null

        if (isSupport && message.actions) {
            actionsBar = (
                <div className="action-bar-container">
                    <div className="inline-flex space-x-3 p-1">
                        {message.actions.map((action, idx) => (
                            <div
                                key={idx}
                                className="action-chip blue-glass-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer"
                                onClick={() => onActionClick('SUPPORT_URL', { url: action.url })}
                            >
                                {action.label}
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
        // SUBMENU DE CHIPS (CATEGORÍAS)
        else if (hasSubMenu && message.type !== 'place_not_found') {
            const subChips = subcategoriesMap[message.menuKey]
            actionsBar = (
                <div className="action-bar-container">
                    <div className="inline-flex space-x-3 p-1">
                        {subChips.map((chip, idx) => (
                            <div
                                key={idx}
                                className="action-chip glass-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer"
                                onClick={() => onActionClick('SUBMENU_CHIP', { query: chip.query })}
                            >
                                {chip.label}
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
        // BOTONES DE ACCIÓN ESTÁNDAR (LUGAR O CATEGORÍA)
        else if (message.type !== 'place_not_found') {
            const isPlace = message.type === 'place'
            const isHealthPlace = message.isHealthPlace === true
            const entityName = isPlace
                ? (message.placeName || (currentLanguage === 'es' ? 'Ubicación' : 'Location'))
                : (message.categoryName || (currentLanguage === 'es' ? 'Categoría' : 'Category'))

            const actionButtons = []

            // Botón Website
            if (isPlace && message.websiteUrl) {
                actionButtons.push(
                    <div
                        key="website"
                        className="action-chip blue-glass-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer"
                        onClick={() => onActionClick('WEBSITE', { websiteUrl: message.websiteUrl })}
                    >
                        {strings.btnWebsite}
                    </div>
                )
            }

            // Botón Mapa
            if (message.mapUrl) {
                actionButtons.push(
                    <div
                        key="map"
                        className="action-chip blue-glass-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer"
                        onClick={() => onActionClick('MAP', { mapUrl: message.mapUrl })}
                    >
                        {strings.btnMap}
                    </div>
                )
            }

            // Botón Teléfono (solo si NO es salud)
            if (isPlace && !isHealthPlace && message.placePhone) {
                actionButtons.push(
                    <div
                        key="phone"
                        className="action-chip blue-glass-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer"
                        onClick={() => onActionClick('PHONE', { phone: message.placePhone })}
                    >
                        {strings.btnPhone}
                    </div>
                )
            }

            // Botón Reseñas (solo si NO es salud)
            if (isPlace && !isHealthPlace && message.reviewUrl) {
                actionButtons.push(
                    <div
                        key="review"
                        className="action-chip blue-glass-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer"
                        onClick={() => onActionClick('REVIEW', { reviewUrl: message.reviewUrl })}
                    >
                        {strings.btnReview}
                    </div>
                )
            }

            // Botón Búsqueda Google
            if (entityName) {
                actionButtons.push(
                    <div
                        key="search"
                        className="action-chip blue-glass-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer"
                        onClick={() => onActionClick('SEARCH', { entityName: entityName })}
                    >
                        {strings.btnSearch}
                    </div>
                )
            }

            if (actionButtons.length > 0) {
                actionsBar = (
                    <div className="action-bar-container">
                        <div className="inline-flex space-x-3 p-1">
                            {actionButtons}
                        </div>
                    </div>
                )
            }
        }

        return (
            <div className="flex flex-col justify-start w-full mb-2" ref={bubbleRef}>
                <div className="flex flex-col items-start">
                    <div className="model-bubble-wrapper">
                        {imageHTML}
                        <div className="model-bubble">
                            <div className="markdown-content" data-raw-text={message.text}></div>
                        </div>
                    </div>
                    {actionsBar}
                    {timeStr && (
                        <div className="model-timestamp-container">
                            <span className="timestamp">{timeStr}</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return null
}
