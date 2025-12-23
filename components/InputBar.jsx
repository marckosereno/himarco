'use client'

export default function InputBar({
    inputValue,
    placeholder,
    isSPSMode,
    isSendButtonDisabled,
    currentLanguage,
    onInputChange,
    onKeyPress,
    onFocus,
    onToggleSPS,
    onSend,
    inputRef,
    uiStrings
}) {
    const strings = uiStrings[currentLanguage]

    return (
        <div id="bottom-bar-search-wrapper" className="w-full">
            <div className="bottom-bar-wrapper">
                {/* Barra de búsqueda */}
                <div id="map-search-bar" className="map-search-bar mb-2 w-full">
                    <input
                        type="text"
                        id="user-input"
                        ref={inputRef}
                        className={`map-input ${isSPSMode ? 'sps-mode' : ''}`}
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={onInputChange}
                        onKeyPress={onKeyPress}
                        onFocus={onFocus}
                        autoComplete="new-text-value"
                        inputMode="text"
                    />
                </div>

                {/* Contenedor de botones */}
                <div id="input-area-container" className="flex justify-between items-center w-full">
                    {/* Botón Toggle SPS Mode */}
                    <div id="bottom-left-actions">
                        <button
                            id="toggle-mode-button"
                            className={isSPSMode ? 'active' : ''}
                            title="Alternar Modo Búsqueda Geográfica"
                            onClick={onToggleSPS}
                        >
                            <span id="toggle-icon" className="text-xl">💬</span>
                            <span id="toggle-text">
                                {isSPSMode ? strings.spsMode : strings.chatMode}
                            </span>
                        </button>
                    </div>

                    {/* Botón de Enviar */}
                    <button
                        id="send-message-button"
                        className="transition disabled:opacity-50"
                        disabled={isSendButtonDisabled}
                        onClick={onSend}
                    >
                        <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            x="0px"
                            y="0px"
                            viewBox="0 0 122.88 122.88"
                            className="flex-shrink-0"
                        >
                            <g>
                                <path
                                    className="st0"
                                    d="M62.43,122.88h-1.98c0-16.15-6.04-30.27-18.11-42.34C30.27,68.47,16.16,62.43,0,62.43v-1.98 c16.16,0,30.27-6.04,42.34-18.14C54.41,30.21,60.45,16.1,60.45,0h1.98c0,16.15,6.04,30.27,18.11,42.34 c12.07,12.07,26.18,18.11,42.34,18.11v1.98c-16.15,0-30.27,6.04-42.34,18.11C68.47,92.61,62.43,106.72,62.43,122.88L62.43,122.88z"
                                />
                            </g>
                        </svg>
                        <span id="go-text">{strings.goButton}</span>
                    </button>
                </div>

                {/* Botón oculto (legacy) */}
                <button id="go-button" className="hidden"></button>
            </div>
        </div>
    )
}
