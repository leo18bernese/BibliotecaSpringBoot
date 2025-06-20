// src/components/utils/ScrollToTop.js

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
    // Estrae il 'pathname' dall'oggetto location.
    // Il pathname è la parte dell'URL dopo il dominio (es. "/libri/12")
    const { pathname } = useLocation();

    // Usa l'hook useEffect per eseguire un'azione quando il 'pathname' cambia.
    useEffect(() => {
        // Fa lo scroll della finestra fino alla posizione (0, 0), ovvero l'inizio della pagina.
        window.scrollTo(0, 0);
    }, [pathname]); // L'array di dipendenze assicura che questo effetto venga eseguito solo quando il pathname cambia.

    return null; // Questo componente non deve renderizzare alcun elemento visibile.
}

export default ScrollToTop;