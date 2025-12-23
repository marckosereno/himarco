'use client'

import { useEffect, useRef } from 'react'

export default function ChipGroups({
    currentLanguage,
    categoriesVisible,
    languageMenuVisible,
    dynamicChipsData,
    showQuickActionFullList,
    lastTotalCount,
    autocompletePredictions,
    showAutocompleteChips,
    onCategoryClick,
    onLanguageClick,
    onDynamicChipClick,
    onViewAllPlaces,
    onAutocompleteChipClick,
    onToggleCategories,
    onToggleLanguage,
    onMenuAction,
    uiStrings
}) {
    const categoryChipsRef = useRef([])
    const languageChipsRef = useRef([])
    const dynamicChipsRef = useRef([])

    const strings = uiStrings[currentLanguage]

    // Datos de chips de categorías
    const categoryChipsData = [
        {
            label: strings.chipHealth,
            queryEs: "Dime sobre la Categoría Salud y Estética en Progreso",
            queryEn: "Tell me about the Health and Beauty Category in Progreso",
            emoji: "🏥",
            color: "green"
        },
        {
            label: strings.chipShopping,
            queryEs: "Dime sobre la Categoría Compras y Tiendas en Progreso",
            queryEn: "Tell me about the Shopping and Stores Category in Progreso",
            emoji: "🛍️",
            color: "blue"
        },
        {
            label: strings.chipEntertainment,
            queryEs: "Dime sobre la Categoría Entretenimiento y Atracciones en Progreso",
            queryEn: "Tell me about the Entertainment and Attractions Category in Progreso",
            emoji: "🎺",
            color: "purple"
        },
        {
            label: strings.chipRestaurant,
            queryEs: "Cuentame sobre la Categoría de Restaurantes",
            queryEn: "Tell me about Restaurants",
            emoji: "🍽",
            color: "yellow"
        }
    ]

    // Datos de chips de idioma
    const languageChipsData = [
        { lang: 'es', label: '🇲🇽 Español' },
        { lang: 'en', label: '🇺🇸 English' }
    ]

    // Efecto de ola para chips de categorías
    useEffect(() => {
        if (categoriesVisible) {
            categoryChipsRef.current.forEach((chip, index) => {
                if (chip) {
                    chip.style.transition = 'none'
                    chip.classList.remove('visible-chip')
                    void chip.offsetWidth
                    setTimeout(() => {
                        chip.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out'
                        chip.classList.add('visible-chip')
                    }, index * 100)
                }
            })
        } else {
            categoryChipsRef.current.forEach(chip => {
                if (chip) chip.classList.remove('visible-chip')
            })
        }
    }, [categoriesVisible])

    // Efecto de ola para chips de idioma
    useEffect(() => {
        if (languageMenuVisible) {
            languageChipsRef.current.forEach((chip, index) => {
                if (chip) {
                    chip.style.transition = 'none'
                    chip.classList.remove('visible-chip')
                    void chip.offsetWidth
                    setTimeout(() => {
                        chip.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out'
                        chip.classList.add('visible-chip')
                    }, index * 100)
                }
            })
        } else {
            languageChipsRef.current.forEach(chip => {
                if (chip) chip.classList.remove('visible-chip')
            })
        }
    }, [languageMenuVisible])

    // Efecto de ola para chips dinámicos
    useEffect(() => {
        if (dynamicChipsData.length > 0) {
            dynamicChipsRef.current.forEach((chip, index) => {
                if (chip) {
                    chip.style.opacity = '0'
                    chip.style.transform = 'translateY(20px)'
                    chip.style.transition = 'none'
                    void chip.offsetWidth
                    setTimeout(() => {
                        chip.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out'
                        chip.style.opacity = '1'
                        chip.style.transform = 'translateY(0)'
                    }, index * 100)
                }
            })
        }
    }, [dynamicChipsData])

    return (
        <div id="quick-replies-container" className="quick-replies-container flex-shrink-0 flex flex-col space-y-2">
            {/* Chips de Autocompletado */}
            {showAutocompleteChips && (
                <div id="autocomplete-chips-group-container" className="autocomplete-chips-group-container">
                    {autocompletePredictions.map((prediction, idx) => {
                        let chipText = prediction.structured_formatting
                            ? prediction.structured_formatting.main_text
                            : prediction.description

                        if (prediction.structured_formatting && prediction.structured_formatting.secondary_text) {
                            chipText += ` (${prediction.structured_formatting.secondary_text.split(',')[0].trim()})`
                        }

                        return (
                            <button
                                key={idx}
                                className="autocomplete-chip"
                                onClick={() => onAutocompleteChipClick(prediction)}
                            >
                                {chipText}
                            </button>
                        )
                    })}
                    <div className="attribution-chip">
                        Powered by Google
                        <a
                            href="https://cloud.google.com/maps-platform/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#007bff', marginLeft: '5px' }}
                        >
                            Términos
                        </a>
                    </div>
                </div>
            )}

            {/* Botón "Ver todos los lugares" */}
            {showQuickActionFullList && (
                <div id="quick-action-full-list" className="px-4 pt-0 pb-2">
                    <div
                        id="btn-view-all-places"
                        className="action-chip flex items-center p-3 rounded-xl text-lg font-bold cursor-pointer transition glass-chip justify-center"
                        onClick={onViewAllPlaces}
                    >
                        ➡️ {currentLanguage === 'es' ? `Ver todos los ${lastTotalCount} lugares` : `View all ${lastTotalCount} places`}
                    </div>
                </div>
            )}

            {/* Chips Dinámicos */}
            {dynamicChipsData.length > 0 && (
                <div id="dynamic-chips-group" className="chip-group-scroll px-4 pt-0">
                    <div id="dynamic-chips-list" className="inline-flex space-x-3 pt-2 br-4">
                        {dynamicChipsData.map((chip, idx) => (
                            <div
                                key={idx}
                                ref={el => dynamicChipsRef.current[idx] = el}
                                className="dynamic-chip action-chip glass-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer"
                                onClick={() => onDynamicChipClick(chip.query)}
                            >
                                {chip.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chips de Categorías */}
            {categoriesVisible && (
                <div id="category-chips-group" className="chip-group-scroll px-4">
                    <div id="category-chips-list" className="inline-flex space-x-3 pb-3 border-b border-gray-200">
                        {categoryChipsData.map((chip, idx) => (
                            <div
                                key={idx}
                                ref={el => categoryChipsRef.current[idx] = el}
                                className={`category-chip flex items-center p-2 rounded-xl text-sm border border-${chip.color}-500 bg-${chip.color}-50 text-${chip.color}-700 cursor-pointer transition hover:bg-${chip.color}-100`}
                                onClick={() => onCategoryClick(currentLanguage === 'es' ? chip.queryEs : chip.queryEn)}
                            >
                                {chip.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chips de Idioma */}
            {languageMenuVisible && (
                <div id="language-chips-group" className="chip-group-scroll px-4">
                    <div className="inline-flex space-x-3 pb-3 border-b border-gray-200">
                        {languageChipsData.map((chip, idx) => (
                            <div
                                key={idx}
                                ref={el => languageChipsRef.current[idx] = el}
                                className="language-chip flex items-center p-2 rounded-full text-sm font-semibold border border-gray-400 bg-white text-gray-800 cursor-pointer transition hover:bg-gray-100"
                                onClick={() => onLanguageClick(chip.lang)}
                            >
                                {chip.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Menu de Acciones (Principal) */}
            <div id="menu-actions" className="chip-group-scroll px-4">
                <div className="inline-flex space-x-3">
                    <div
                        id="btn-categorias"
                        className="menu-action-chip action-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer transition glass-chip"
                        onClick={onToggleCategories}
                    >
                        {strings.categories}
                    </div>
                    <div
                        id="btn-lenguaje"
                        className="menu-action-chip action-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer transition glass-chip"
                        onClick={onToggleLanguage}
                    >
                        {strings.language}
                    </div>
                    <div
                        id="btn-comollegar"
                        className="menu-action-chip action-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer transition glass-chip"
                        onClick={() => onMenuAction('GET_THERE', currentLanguage === 'es' ? "Dime cómo llegar a Progreso, Tamaulipas." : "Tell me how to get to Progreso, Tamaulipas.")}
                    >
                        {strings.getThere}
                    </div>
                    <div
                        id="btn-info"
                        className="menu-action-chip action-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer transition glass-chip"
                        onClick={() => onMenuAction('INFO', currentLanguage === 'es' ? "Información general sobre Nuevo Progreso." : "General information about Nuevo Progreso.")}
                    >
                        {strings.info}
                    </div>
                    <div
                        id="btn-support"
                        className="menu-action-chip action-chip flex items-center p-2 rounded-full text-sm font-semibold cursor-pointer transition glass-chip"
                        onClick={() => onMenuAction('SUPPORT')}
                    >
                        ☕ Apóyame
                    </div>
                </div>
            </div>
        </div>
    )
}
