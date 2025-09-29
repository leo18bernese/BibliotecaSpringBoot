import React, {useEffect, useRef} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';

const BookPdfDownloader = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const effectRan = useRef(false); // Flag per il controllo

    useEffect(() => {
        // Controllo per evitare il doppio render in Strict Mode
        if (effectRan.current === true || process.env.NODE_ENV !== 'development') {
            const downloadPdf = async () => {
                try {
                    const url = `http://localhost:8080/api/libri/${id}/pdf`;
                    const response = await axios.get(url, {responseType: 'blob'});

                    const filename = `report_libro_${id}.pdf`;
                    const fileURL = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = fileURL;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();

                } catch (error) {
                    console.error("Errore nel download automatico del PDF:", error);
                    alert("Si è verificato un errore durante il download del report.");
                }
            };

            downloadPdf();
        }

        // Imposta il flag per il prossimo render
        return () => {
            effectRan.current = true;
        };
    }, [id, navigate]);

    return (
        <div style={{padding: '20px', textAlign: 'center'}}>
            <h1>Preparazione del download...</h1>
            <p>Il download del tuo file PDF inizierà a breve. Se non dovesse partire, verifica le impostazioni del tuo
                browser.</p>
        </div>
    );
};

export default BookPdfDownloader;