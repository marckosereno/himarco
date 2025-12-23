'use client'

import { useState, useEffect, useCallback } from 'react'

export function useNotifications() {
    // Estados de preferencias
    const [notificationPreferences, setNotificationPreferences] = useState({
        news: true,
        reminders: true,
        promotions: false
    })

    // Estados del modal
    const [showNotificationModal, setShowNotificationModal] = useState(false)

    // Estado de alertas activas
    const [activeAlert, setActiveAlert] = useState(null)

    // ====================================================================
    // PERSISTENCIA DE PREFERENCIAS
    // ====================================================================

    const saveNotificationPreferences = useCallback((prefs) => {
        try {
            localStorage.setItem('notificationPreferences', JSON.stringify(prefs))
        } catch (e) {
            console.error("Error al guardar preferencias de notificación:", e)
        }
    }, [])

    const loadNotificationPreferences = useCallback(() => {
        try {
            const savedPrefs = localStorage.getItem('notificationPreferences')
            if (savedPrefs) {
                const parsedPrefs = JSON.parse(savedPrefs)
                setNotificationPreferences(parsedPrefs)
            }
        } catch (e) {
            console.error("Error al cargar preferencias de notificación:", e)
        }
    }, [])

    // Cargar preferencias al montar
    useEffect(() => {
        loadNotificationPreferences()
    }, [loadNotificationPreferences])

    // ====================================================================
    // ACTUALIZACIÓN DE PREFERENCIAS
    // ====================================================================

    const updatePreference = useCallback((key, value) => {
        setNotificationPreferences(prev => ({
            ...prev,
            [key]: value
        }))
    }, [])

    const applyPreferences = useCallback(() => {
        saveNotificationPreferences(notificationPreferences)
        setShowNotificationModal(false)
        return 'Preferencias de notificaciones guardadas. ✅'
    }, [notificationPreferences, saveNotificationPreferences])

    const discardChanges = useCallback(() => {
        loadNotificationPreferences()
        setShowNotificationModal(false)
    }, [loadNotificationPreferences])

    // ====================================================================
    // SISTEMA DE ALERTAS
    // ====================================================================

    const alertUser = useCallback((message, type = 'i', preferenceType = 'news') => {
        // Las alertas de error SIEMPRE se muestran
        if (type !== 'error' && !notificationPreferences[preferenceType]) {
            console.log(`Notificación de tipo "${preferenceType}" deshabilitada. Mensaje: ${message}`)
            return
        }

        // Si ya hay una alerta activa, la removemos
        if (activeAlert) {
            setActiveAlert(null)
        }

        // Determinar el icono según el tipo
        const icon = type === 'error' 
            ? '❌' 
            : (type === 'i' ? 'ℹ️' : '✅')

        // Crear nueva alerta
        const newAlert = {
            id: Date.now(),
            message: message,
            icon: icon,
            type: type
        }

        setActiveAlert(newAlert)

        // Auto-ocultar después de 4 segundos
        setTimeout(() => {
            setActiveAlert(null)
        }, 4000)

    }, [notificationPreferences, activeAlert])

    // ====================================================================
    // CIERRE MANUAL DE ALERTA
    // ====================================================================

    const closeAlert = useCallback(() => {
        setActiveAlert(null)
    }, [])

    // ====================================================================
    // CONTROL DEL MODAL
    // ====================================================================

    const openNotificationModal = useCallback(() => {
        setShowNotificationModal(true)
    }, [])

    const closeNotificationModal = useCallback(() => {
        setShowNotificationModal(false)
    }, [])

    // ====================================================================
    // RETURN
    // ====================================================================

    return {
        // Preferencias
        notificationPreferences,
        updatePreference,
        applyPreferences,
        discardChanges,
        
        // Modal
        showNotificationModal,
        openNotificationModal,
        closeNotificationModal,
        
        // Alertas
        activeAlert,
        alertUser,
        closeAlert
    }
}
