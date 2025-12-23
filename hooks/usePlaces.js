'use client'

import { useState, useEffect, useCallback } from 'react'

// Parámetros de búsqueda (igual que en el backend)
const CENTER_LAT = 26.064
const CENTER_LNG = -98.005
const LAT_OFFSET = 0.135
const LNG_OFFSET = 0.150

const EXTENDED_NE_BOUND = { lat: CENTER_LAT + LAT_OFFSET, lng: CENTER_LNG + LNG_OFFSET }
const EXTENDED_SW_BOUND = { lat: CENTER_LAT - LAT_OFFSET, lng: CENTER_LNG - LNG_OFFSET }

export function usePlaces() {
    const [autocompleteService, setAutocompleteService] = useState(null)
    const [autocompletePredictions, setAutocompletePredictions] = useState([])
    const [showAutocompleteChips, setShowAutocompleteChips] = useState(false)

    // ====================================================================
    // INICIALIZACIÓN DE GOOGLE PLACES
    // ====================================================================

    useEffect(() => {
        // Verificar si Google Maps API está cargada
        const initializeAutocomplete = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                const service = new window.google.maps.places.AutocompleteService()
                setAutocompleteService(service)
                console.log("Google Maps AutocompleteService inicializado.")
            } else {
                console.warn("Google Maps API no está disponible todavía, reintentando...")
                setTimeout(initializeAutocomplete, 500)
            }
        }

        initializeAutocomplete()
    }, [])

    // ====================================================================
    // BÚSQUEDA DE AUTOCOMPLETADO
    // ====================================================================

    const handleAutocompleteInput = useCallback((query, isSPSMode, currentMentionPlace) => {
        if (!autocompleteService) {
            console.warn("AutocompleteService no está inicializado")
            return
        }

        // Determinar el query a buscar
        let searchQuery = query

        // Si NO estamos en SPS mode, verificar si es modo @mención
        if (!isSPSMode) {
            const mentionIndex = query.lastIndexOf('@')
            
            if (mentionIndex !== -1 && !currentMentionPlace) {
                // Extraer texto después del @
                searchQuery = query.substring(mentionIndex + 1).trim()
            } else if (currentMentionPlace) {
                // Ya hay un lugar mencionado, ocultar autocomplete
                setShowAutocompleteChips(false)
                return
            } else {
                // No es mención, ocultar
                setShowAutocompleteChips(false)
                return
            }
        }

        // Si el query es muy corto, no buscar
        if (searchQuery.length <= 2) {
            setShowAutocompleteChips(false)
            setAutocompletePredictions([])
            return
        }

        // Configurar bounds de Nuevo Progreso
        const progressoBounds = new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(EXTENDED_SW_BOUND.lat, EXTENDED_SW_BOUND.lng),
            new window.google.maps.LatLng(EXTENDED_NE_BOUND.lat, EXTENDED_NE_BOUND.lng)
        )

        // Llamar a la API de Autocomplete
        autocompleteService.getPlacePredictions({
            input: searchQuery,
            bounds: progressoBounds,
            strictBounds: true,
            types: ['establishment', 'geocode'],
            componentRestrictions: { country: 'mx' }
        }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                setAutocompletePredictions(predictions)
                setShowAutocompleteChips(true)
            } else {
                setAutocompletePredictions([])
                setShowAutocompleteChips(false)
            }
        })

    }, [autocompleteService])

    // ====================================================================
    // SELECCIÓN DE LUGAR
    // ====================================================================

    const onPlaceSelected = useCallback((prediction, callbacks) => {
        const { 
            onSPSSearch, 
            onMentionSelect, 
            isSPSMode, 
            currentInputValue 
        } = callbacks

        const placeId = prediction.place_id
        const placeName = prediction.structured_formatting 
            ? prediction.structured_formatting.main_text 
            : prediction.description
        
        const placeDescription = prediction.description

        // Ocultar chips de autocomplete
        setShowAutocompleteChips(false)
        setAutocompletePredictions([])

        // MODO SPS: Búsqueda directa
        if (isSPSMode) {
            onSPSSearch(placeId, placeDescription)
        } 
        // MODO MENCIÓN: Insertar @lugar en el input
        else {
            const mentionIndex = currentInputValue.lastIndexOf('@')
            let newInputValue = currentInputValue

            if (mentionIndex !== -1) {
                newInputValue = currentInputValue.substring(0, mentionIndex) + '@' + placeName
            }

            onMentionSelect({
                placeId: placeId,
                textName: placeName,
                newInputValue: newInputValue
            })
        }

    }, [])

    // ====================================================================
    // LIMPIAR AUTOCOMPLETE
    // ====================================================================

    const clearAutocomplete = useCallback(() => {
        setShowAutocompleteChips(false)
        setAutocompletePredictions([])
    }, [])

    // ====================================================================
    // RETURN
    // ====================================================================

    return {
        autocompleteService,
        autocompletePredictions,
        showAutocompleteChips,
        handleAutocompleteInput,
        onPlaceSelected,
        clearAutocomplete
    }
}
