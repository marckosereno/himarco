'use client'

export default function TypingBubble({ type, show }) {
    // type: 'user' o 'model'
    const isUser = type === 'user'

    const containerClass = isUser
        ? 'flex justify-end'
        : 'flex justify-start'

    const bubbleClass = isUser
        ? 'user-bubble bg-black text-white p-3 shadow-md'
        : 'model-bubble-wrapper p-3 shadow-md'

    const bubbleId = isUser ? 'user-typing-bubble' : 'model-typing-bubble'

    return (
        <div id={bubbleId} className={`${containerClass} ${show ? 'show' : ''}`}>
            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={bubbleClass}>
                    <div className="typing-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
