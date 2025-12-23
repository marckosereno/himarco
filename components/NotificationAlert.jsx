'use client'

import { useEffect, useState } from 'react'

export default function NotificationAlert({ alert, onClose }) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (alert) {
            // Pequeño delay para activar la animación
            setTimeout(() => setShow(true), 10)
        } else {
            setShow(false)
        }
    }, [alert])

    if (!alert) return null

    return (
        <div id="app-alert-container" className="fixed top-0 w-full flex justify-center z-50 pointer-events-none">
            <div className={`notification-card opacity-0 pointer-events-auto ${show ? 'show' : ''}`}>
                <div className="message-content">
                    <span className="mr-2">{alert.icon}</span>
                    <span>{alert.message}</span>
                </div>
                <button
                    className="close-btn"
                    aria-label="Cerrar notificación"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>
        </div>
    )
}
