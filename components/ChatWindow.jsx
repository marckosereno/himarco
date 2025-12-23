'use client'

import { useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { usePlaces } from '@/hooks/usePlaces'
import { useNotifications } from '@/hooks/useNotifications'
import HeaderBar from './HeaderBar'
import MessageContainer from './MessageContainer'
import ChipGroups from './ChipGroups'
import InputBar from './InputBar'
import NotificationModal from './NotificationModal'
import NotificationAlert from './NotificationAlert'

export default function ChatWindow() {
    // ====================================================================
    // HOOKS
    // ====================================================================

    const chat = useChat()
    const places = usePlaces()
    const notifications = useNotifications()

    // ====================================================================
    // SOLUCIÓN PARA BUG DE 100vh EN SAFARI (iOS/iPadOS)
    // ====================================================================

    useEffect(() => {
        function setAppHeight() {
            const vh = window.innerHeight * 0.01
            document.documentElement.style.setProperty('--vh', `${vh}px`)
        }

        setAppHeight()
        window.addEventListener('resize', setAppHeight)
        window.addEventListener('orientationchange', setAppHeight)

        return () => {
            window.removeEventListener('resize', setAppHeight)
            window.removeEventListener('orientationchange', setAppHeight)
        }
    }, [])

    // ====================================================================
    // MANEJADORES DE EVENTOS
    // ====================================================================

    // Manejar cambio de idioma
    const handleLanguageChange = (lang) => {
        const message = chat.changeLanguage(lang)
        notifications.alertUser(message, 'i', 'news')
    }

    // Manejar limpieza de historial
    const handleClearHistory = () => {
        chat.vibrateDevice()
        const message = chat.clearChatHistory()
        notifications.alertUser(message, 'i', 'news')
    }

    // Manejar chips de categoría
    const handleCategoryClick = (query) => {
        chat.vibrateDevice()
        chat.setCategoriesVisible(false)
        chat.handleSend(query)
    }

    // Manejar chips dinámicos
    const handleDynamicChipClick = (query) => {
        chat.vibrateDevice()
        chat.handleSend(query)
    }

    // Manejar botón "Ver todos los lugares"
    const handleViewAllPlaces = () => {
        chat.vibrateDevice()

        if (chat.lastApiQuery) {
            const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chat.lastApiQuery + " Nuevo Progreso Tamps")}`
            window.open(searchUrl, '_blank')

            const message = chat.currentLanguage === 'es'
                ? `Abriendo la lista completa en Google: "${chat.lastApiQuery}"`
                : `Opening the full list on Google: "${chat.lastApiQuery}"`

            notifications.alertUser(message, 'i', 'news')
        } else {
            const message = chat.currentLanguage === 'es'
                ? 'No se encontró la consulta de lugares. Por favor, intenta de nuevo.'
                : 'Place query not found. Please try again.'

            notifications.alertUser(message, 'error')
        }
    }

    // Manejar cambio en el input
    const handleInputChange = (e) => {
        const value = e.target.value
        chat.setInputValue(value)

        // Manejar typing indicator
        if (value.trim().length > 0 && !chat.isBotTyping && !chat.isSPSMode) {
            chat.setIsUserTyping(true)
        } else {
            chat.setIsUserTyping(false)
        }

        // Manejar autocomplete
        places.handleAutocompleteInput(value, chat.isSPSMode, chat.currentMentionPlace)

        // Verificar si el usuario borró la mención
        if (chat.currentMentionPlace) {
            const mentionText = '@' + chat.currentMentionPlace.textName
            if (!value.includes(mentionText)) {
                chat.resetMentionMode()
            }
        }
    }

    // Manejar tecla Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !chat.isSPSMode && chat.inputValue.trim() !== '') {
            chat.handleSend()
        }
    }

    // Manejar focus en input (fix de teclado iOS)
    const handleInputFocus = () => {
        setTimeout(() => {
            chat.scrollToBottom()

            // Scroll adicional para iOS
            const bottomWrapper = document.getElementById('bottom-bar-search-wrapper')
            if (bottomWrapper) {
                bottomWrapper.scrollIntoView({
                    behavior: 'instant',
                    block: 'end'
                })
            }
        }, 180)
    }

    // Manejar selección de lugar en autocomplete
    const handlePlaceSelection = (prediction) => {
        places.onPlaceSelected(prediction, {
            onSPSSearch: (placeId, description) => {
                // Agregar mensaje del usuario al historial
                const userMessage = chat.currentLanguage === 'es'
                    ? `⚡️ Búsqueda SPS del lugar: **${description}**`
                    : `⚡️ SPS Search for place: **${description}**`

                // Enviar búsqueda directa
                chat.handleSend(`Búsqueda directa del lugar ${prediction.structured_formatting?.main_text || description}`, placeId)
            },
            onMentionSelect: (mentionData) => {
                chat.setCurrentMentionPlace({
                    placeId: mentionData.placeId,
                    textName: mentionData.textName
                })
                chat.setInputValue(mentionData.newInputValue)
                chat.setIsMentionMode(false)
            },
            isSPSMode: chat.isSPSMode,
            currentInputValue: chat.inputValue
        })
    }

    // Manejar toggle de modo SPS
    const handleToggleSPS = () => {
        chat.toggleSPSMode()
        places.clearAutocomplete()
    }

    // Manejar botón de enviar
    const handleSendClick = () => {
        if (!chat.isSPSMode && chat.inputValue.trim() !== '') {
            chat.handleSend()
        }
    }

    // ====================================================================
    // OBTENER PLACEHOLDER DEL INPUT
    // ====================================================================

    const getInputPlaceholder = () => {
        const strings = chat.UI_STRINGS[chat.currentLanguage]

        if (chat.isBotTyping) {
            return strings.loadingStatus
        }

        if (chat.isSPSMode) {
            return strings.searchPlaceholder
        }

        if (chat.currentMentionPlace) {
            return strings.mentionPlaceholder(chat.currentMentionPlace.textName)
        }

        return strings.placeholder
    }

    // ====================================================================
    // DETERMINAR SI EL BOTÓN DE ENVIAR DEBE ESTAR DESHABILITADO
    // ====================================================================

    const isSendButtonDisabled = chat.isSPSMode || chat.inputValue.trim() === '' || chat.isBotTyping

    // ====================================================================
    // RENDER
    // ====================================================================

    return (
        <div id="chat-window" className="chat-window">
            {/* Header con botones de acción */}
            <HeaderBar
                onClearHistory={handleClearHistory}
                onOpenNotifications={notifications.openNotificationModal}
                vibrateDevice={chat.vibrateDevice}
            />

            {/* Contenedor de alertas */}
            <NotificationAlert
                alert={notifications.activeAlert}
                onClose={notifications.closeAlert}
            />

            {/* Contenedor de mensajes */}
            <MessageContainer
                chatHistory={chat.chatHistory}
                isBotTyping={chat.isBotTyping}
                isUserTyping={chat.isUserTyping}
                currentLanguage={chat.currentLanguage}
                formatTime={chat.formatTime}
                messageContainerRef={chat.messageContainerRef}
                onActionClick={(action, data) => {
                    chat.vibrateDevice()

                    if (action === 'MAP' && data.mapUrl) {
                        window.open(data.mapUrl, '_blank')
                        notifications.alertUser(
                            chat.currentLanguage === 'es' ? 'Abriendo mapa en nueva ventana.' : 'Opening map in new window.',
                            'i',
                            'news'
                        )
                    } else if (action === 'SEARCH' && data.entityName) {
                        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(data.entityName + " Nuevo Progreso Tamps")}`
                        window.open(searchUrl, '_blank')
                        notifications.alertUser(
                            chat.currentLanguage === 'es' ? `Buscando "${data.entityName}" en Google.` : `Searching for "${data.entityName}" on Google.`,
                            'i',
                            'news'
                        )
                    } else if (action === 'PHONE' && data.phone) {
                        const phone = data.phone.replace(/\D/g, '')
                        window.location.href = `tel:${phone}`
                        notifications.alertUser(
                            chat.currentLanguage === 'es' ? `Llamando a ${data.phone}.` : `Calling ${data.phone}.`,
                            'i',
                            'news'
                        )
                    } else if (action === 'REVIEW' && data.reviewUrl) {
                        window.open(data.reviewUrl, '_blank')
                        notifications.alertUser(
                            chat.currentLanguage === 'es' ? 'Abriendo reseña en nueva ventana.' : 'Opening review in new window.',
                            'i',
                            'news'
                        )
                    } else if (action === 'WEBSITE' && data.websiteUrl) {
                        window.open(data.websiteUrl, '_blank')
                        notifications.alertUser(
                            chat.currentLanguage === 'es' ? 'Abriendo sitio web en nueva ventana.' : 'Opening website in new window.',
                            'i',
                            'news'
                        )
                    } else if (action === 'SUPPORT_URL' && data.url) {
                        window.open(data.url, '_blank')
                        notifications.alertUser('¡Gracias por tu apoyo! ☕❤️', 'i', 'news')
                    } else if (action === 'SUBMENU_CHIP' && data.query) {
                        chat.handleSend(data.query)
                    }
                }}
                subcategoriesMap={chat.SUBCATEGORIES_MAP}
                uiStrings={chat.UI_STRINGS}
            />

            {/* Área inferior: Chips + Input */}
            <div className="bottom-action-area flex-shrink-0 flex flex-col space-y-2">
                {/* Chips de grupos */}
                <ChipGroups
                    currentLanguage={chat.currentLanguage}
                    categoriesVisible={chat.categoriesVisible}
                    languageMenuVisible={chat.languageMenuVisible}
                    dynamicChipsData={chat.dynamicChipsData}
                    showQuickActionFullList={chat.showQuickActionFullList}
                    lastTotalCount={chat.lastTotalCount}
                    autocompletePredictions={places.autocompletePredictions}
                    showAutocompleteChips={places.showAutocompleteChips}
                    onCategoryClick={handleCategoryClick}
                    onLanguageClick={handleLanguageChange}
                    onDynamicChipClick={handleDynamicChipClick}
                    onViewAllPlaces={handleViewAllPlaces}
                    onAutocompleteChipClick={handlePlaceSelection}
                    onToggleCategories={() => {
                        chat.vibrateDevice()
                        chat.setCategoriesVisible(!chat.categoriesVisible)
                        if (chat.languageMenuVisible) chat.setLanguageMenuVisible(false)
                    }}
                    onToggleLanguage={() => {
                        chat.vibrateDevice()
                        chat.setLanguageMenuVisible(!chat.languageMenuVisible)
                        if (chat.categoriesVisible) chat.setCategoriesVisible(false)
                    }}
                    onMenuAction={(action, query) => {
                        chat.vibrateDevice()

                        if (chat.categoriesVisible) chat.setCategoriesVisible(false)
                        if (chat.languageMenuVisible) chat.setLanguageMenuVisible(false)

                        if (action === 'GET_THERE' || action === 'INFO') {
                            chat.handleSend(query)
                        } else if (action === 'SUPPORT') {
                            chat.handleSupportClick()
                        }
                    }}
                    uiStrings={chat.UI_STRINGS}
                />

                {/* Barra de input */}
                <InputBar
                    inputValue={chat.inputValue}
                    placeholder={getInputPlaceholder()}
                    isSPSMode={chat.isSPSMode}
                    isSendButtonDisabled={isSendButtonDisabled}
                    currentLanguage={chat.currentLanguage}
                    onInputChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={handleInputFocus}
                    onToggleSPS={handleToggleSPS}
                    onSend={handleSendClick}
                    inputRef={chat.inputRef}
                    uiStrings={chat.UI_STRINGS}
                />
            </div>

            {/* Modal de preferencias */}
            <NotificationModal
                show={notifications.showNotificationModal}
                preferences={notifications.notificationPreferences}
                onClose={notifications.closeNotificationModal}
                onUpdatePreference={notifications.updatePreference}
                onApply={notifications.applyPreferences}
                onDiscard={notifications.discardChanges}
                vibrateDevice={chat.vibrateDevice}
            />
        </div>
    )
}
