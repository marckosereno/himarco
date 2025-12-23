'use client'

import MessageBubble from './MessageBubble'
import TypingBubble from './TypingBubble'

export default function MessageContainer({
    chatHistory,
    isBotTyping,
    isUserTyping,
    currentLanguage,
    formatTime,
    messageContainerRef,
    onActionClick,
    subcategoriesMap,
    uiStrings
}) {
    return (
        <div
            id="message-container"
            ref={messageContainerRef}
            className="flex-grow overflow-y-auto p-4 flex flex-col"
        >
            {/* Renderizar historial de mensajes */}
            {chatHistory.map((message, index) => (
                <MessageBubble
                    key={index}
                    message={message}
                    currentLanguage={currentLanguage}
                    formatTime={formatTime}
                    onActionClick={onActionClick}
                    subcategoriesMap={subcategoriesMap}
                    uiStrings={uiStrings}
                />
            ))}

            {/* Typing indicator del modelo (bot) */}
            <TypingBubble type="model" show={isBotTyping} />

            {/* Typing indicator del usuario */}
            <TypingBubble type="user" show={isUserTyping} />
        </div>
    )
}
