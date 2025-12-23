'use client'

export default function HeaderBar({ onClearHistory, onOpenNotifications, vibrateDevice }) {
    return (
        <div style={{ marginTop: '-28px' }} className="fixed top-0 left-0 w-full z-50 p-4 flex justify-between bg-transparent">
            {/* Botón izquierdo: Limpiar historial */}
            <div id="top-action-bar-left" className="flex items-center space-x-3">
                <div
                    style={{ width: '170px', marginLeft: '-20px' }}
                    id="btn-clear-top"
                    className="action-chip flex items-center text-sm font-semibold text-red-700 cursor-pointer"
                    onClick={() => {
                        vibrateDevice()
                        onClearHistory()
                    }}
                >
                    <img
                        src="https://raw.githubusercontent.com/marckosereno/api/refs/heads/main/project_20251211_2151193-02.png"
                        alt="Logo himarco"
                    />
                </div>
            </div>

            {/* Botón derecho: Notificaciones */}
            <div id="top-action-bar-right" className="flex items-center space-x-3">
                <button
                    id="btn-notifications"
                    className="action-chip flex items-center text-sm font-semibold cursor-pointer"
                    onClick={() => {
                        vibrateDevice()
                        onOpenNotifications()
                    }}
                >
                    🔔
                </button>
            </div>
        </div>
    )
}
