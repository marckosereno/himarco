'use client'

export default function NotificationModal({
    show,
    preferences,
    onClose,
    onUpdatePreference,
    onApply,
    onDiscard,
    vibrateDevice
}) {
    return (
        <div
            id="notification-preferences-modal"
            className={`notification-modal-overlay ${show ? 'show' : ''}`}
            onClick={onClose}
        >
            <div
                className="notification-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                    Preferencias de Notificaciones
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    Elige qué notificaciones quieres recibir.
                </p>

                <div className="space-y-4">
                    {/* Toggle: Noticias de Interfaz */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">Noticias de Interfaz</p>
                            <p className="text-sm text-gray-500">
                                Alertas de cambios de idioma, historial y otros eventos de la aplicación. (Recomendado)
                            </p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                id="toggle-news"
                                checked={preferences.news}
                                onChange={(e) => onUpdatePreference('news', e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    {/* Toggle: Alertas de Ficha */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">Alertas de Ficha</p>
                            <p className="text-sm text-gray-500">
                                Notificaciones de confirmación cuando se muestra información de una ficha de lugar o categoría.
                            </p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                id="toggle-reminders"
                                checked={preferences.reminders}
                                onChange={(e) => onUpdatePreference('reminders', e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    {/* Toggle: Promociones (Deshabilitado) */}
                    <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div>
                            <p className="font-semibold text-gray-800">Promociones y Ofertas</p>
                            <p className="text-sm text-gray-500">
                                Recibe notificaciones sobre promociones especiales. (Próximamente)
                            </p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                id="toggle-promotions"
                                disabled
                                checked={preferences.promotions}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                {/* Info Card */}
                <div className="info-card-panel">
                    <span>ℹ️</span>
                    Recuerda que las <strong>alertas de error</strong> (❌) siempre se mostrarán, independientemente de tus preferencias, para garantizar la usabilidad.
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 mt-8">
                    <button
                        id="btn-discard-changes"
                        className="py-2 px-4 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                        onClick={() => {
                            vibrateDevice()
                            onDiscard()
                        }}
                    >
                        Descartar
                    </button>
                    <button
                        id="btn-apply-changes"
                        className="py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                        onClick={() => {
                            vibrateDevice()
                            const message = onApply()
                            // La notificación se maneja en ChatWindow
                        }}
                    >
                        Aplicar Cambios
                    </button>
                </div>
            </div>
        </div>
    )
}
