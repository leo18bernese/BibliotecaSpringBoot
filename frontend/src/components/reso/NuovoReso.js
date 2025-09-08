import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from "react-router-dom";
import toast, {Toaster} from "react-hot-toast";
import {useQuery} from "@tanstack/react-query";

// Funzioni di fetch per i dati dell'ordine
const fetchExistOrdine = async (id) => {
    const response = await axios.get(`/api/ordini/${id}/exists`);
    return response.data;
}

const fetchOrdine = async (id) => {
    const response = await axios.get(`/api/ordini/${id}`);
    return response.data;
}

const fetchMotivi = async () => {
    const response = await axios.get('/api/resi/reasons');
    return response.data;
}

const fetchMetodoRimborso = async () => {
    const response = await axios.get('/api/resi/refund-methods');
    console.log("Metodo di rimborso:", response.data);
    return response.data;
}


// Componente NuovoReso
const NuovoReso = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Stato per la richiesta di reso
    const [resoRequest, setResoRequest] = useState({
        ordineId: id,
        items: []
    });

    // Query per verificare l'esistenza dell'ordine
    const {data: exists, isLoading: existsLoading} = useQuery({
        queryKey: ['ordineExists', id],
        queryFn: () => fetchExistOrdine(id),
        onError: (err) => setError(err.message)
    });

    // Query per ottenere i dettagli dell'ordine
    const {data: ordine, isLoading: isOrdineLoading} = useQuery({
        queryKey: ['ordine', id],
        queryFn: () => fetchOrdine(id),
        enabled: !existsLoading && exists, // Esegui solo se l'ordine esiste
        onError: (err) => setError(err.message)
    });

    const {data: motivi, isLoading: isMotiviLoading} = useQuery({
        queryKey: ['motiviReso'],
        queryFn: fetchMotivi
    });

    const {data: metodoRimborso, isLoading: isMetodoRimborsoLoading} = useQuery({
        queryKey: ['metodoRimborso'],
        queryFn: fetchMetodoRimborso
    });

    // Inizializza lo stato degli item quando l'ordine viene caricato
    useEffect(() => {
        if (ordine && ordine.items) {
            const initialItems = ordine.items.map(item => ({
                ordineItemId: item.id,
                motivo: '',
                descrizione: '',
                quantita: 0,
                selected: false // Aggiunto per gestire la selezione dell'item
            }));
            setResoRequest(prev => ({...prev, items: initialItems}));
        }
    }, [ordine]);

    // Gestore per aggiornare i campi di un item specifico
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...resoRequest.items];
        const currentItem = updatedItems[index];

        console.log(`Updating item at index ${index}: field=${field}, value=${value}`);

        if (field === 'quantita') {
            const maxQuantita = ordine.items[index].quantita;
            // Assicura che la quantità non superi quella acquistata e non sia negativa
            value = Math.max(0, Math.min(Number(value), maxQuantita));
        }

        if (field === 'selected') {
            currentItem.selected = value;
            // Se l'item viene deselezionato, resetta la quantità a 0
            if (!value) {
                currentItem.quantita = 0;
            }
        } else {
            currentItem[field] = value;
        }

        setResoRequest(prev => ({...prev, items: updatedItems}));
    };

    // Gestore per l'invio del form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const itemsToSubmit = resoRequest.items
            .filter(item => item.selected && item.quantita > 0)
            .map(({ordineItemId, motivo, descrizione, quantita}) => ({
                ordineItemId,
                motivo,
                descrizione,
                quantita
            }));

        if (itemsToSubmit.length === 0) {
            toast.error("Seleziona almeno un articolo e specifica la quantità da rendere.");
            setIsLoading(false);
            return;
        }

        if (!resoRequest.metodoRimborso) {
            toast.error("Seleziona un metodo di rimborso.");
            setIsLoading(false);
            return;
        }

        const finalRequest = {
            ordineId: resoRequest.ordineId,
            items: itemsToSubmit
        };

        try {
            const {data} = await axios.post(`/api/resi`, finalRequest);

            toast.success('Richiesta di reso inviata con successo!');

            setTimeout(() => {
                navigate(`/reso/${data.id}`);
            }, 1500);

        } catch (error) {
            console.error("Errore durante l'invio del reso:", error);
            toast.error(error.response?.data?.message || 'Si è verificato un errore.');
            setIsLoading(false);
        }
    };

    if (existsLoading || isOrdineLoading || isMotiviLoading || isMetodoRimborsoLoading) return <div>Caricamento...</div>;
    if (error) return <div>Errore: {error}</div>;
    if (!ordine) return <div>Ordine non trovato.</div>;

    return (
        <>
            <Toaster/>
            <div className="max-w-4xl mx-auto py-6 px-4">
                <h1 className="text-3xl font-semibold mb-2 text-gray-800">Richiedi un Reso</h1>
                <p className="text-lg text-gray-600 mb-6">Segnala i problemi con i tuoi articoli acquistati
                    selezionandoli qui sotto e
                    inserendo le informazioni richieste.</p>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {ordine.items.map((item, index) => (

                            <div key={item.id}
                                 className="border rounded-lg border-gray-400 p-4 bg-gray-200 transition-colors">

                                <div className="flex items-start space-x-4">
                                    <input
                                        type="checkbox"
                                        checked={resoRequest.items[index]?.selected || false}
                                        onChange={(e) => handleItemChange(index, 'selected', e.target.checked)}
                                        className="form-checkbox h-5 w-5 text-blue-600 mt-1 cursor-pointer"
                                    />

                                    <div className="flex-grow">
                                        <h3 className="font-semibold">{item.titolo}</h3>
                                        <p className="text-sm text-gray-500">Quantità
                                            acquistata: {item.quantita}</p>

                                        {resoRequest.items[index]?.selected && (
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label htmlFor={`quantita-${item.id}`}
                                                           className="block text-sm font-medium text-gray-700">Quantità
                                                        da rendere</label>

                                                    <input
                                                        type="number"
                                                        id={`quantita-${item.id}`}
                                                        value={resoRequest.items[index]?.quantita || 0}
                                                        onChange={(e) => handleItemChange(index, 'quantita', e.target.value)}
                                                        min="0"
                                                        max={item.quantita}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor={`motivo-${item.id}`}
                                                           className="block text-sm font-medium text-gray-700">Motivo
                                                        del reso</label>
                                                    <select
                                                        id={`motivo-${item.id}`}
                                                        value={resoRequest.items[index]?.motivo || ''}
                                                        onChange={(e) => handleItemChange(index, 'motivo', e.target.value)}
                                                        required={resoRequest.items[index]?.quantita > 0}
                                                        className="mt-1 block w-full border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                                                    >
                                                        <option value="" disabled>Seleziona un motivo</option>

                                                        {motivi.map((motivo) => (
                                                            <option key={motivo.name}
                                                                    value={motivo.name}> {motivo.displayName}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label htmlFor={`descrizione-${item.id}`}
                                                           className="block text-sm font-medium text-gray-700">Descrizione</label>
                                                    <textarea
                                                        required
                                                        id={`descrizione-${item.id}`}
                                                        rows="3"
                                                        value={resoRequest.items[index]?.descrizione || ''}
                                                        onChange={(e) => handleItemChange(index, 'descrizione', e.target.value)}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                                                        placeholder="Fornisci maggiori dettagli..."
                                                    />
                                                </div>


                                            </div>
                                        )}
                                    </div>
                                </div>


                            </div>
                        ))}
                    </div>

                    <div className="border rounded-lg border-gray-400 p-4 bg-gray-200 transition-colors mt-8">

                        <label htmlFor={`metodo-rimborso`} className="block text-sm font-medium text-gray-700 ">Metodo
                            di
                            Rimborso</label>
                        <select
                            id={`metodo-rimborso`}
                            value={resoRequest.metodoRimborso || ''}
                            onChange={(e) => setResoRequest(prev => ({...prev, metodoRimborso: e.target.value}))}
                            className="mt-1 block w-full border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                        >
                            <option value="" disabled>Seleziona un metodo di rimborso</option>
                            {metodoRimborso.map((metodo) => (
                                <option key={metodo.name} value={metodo.name}>{metodo.displayName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline disabled:bg-blue-300"
                        >
                            {isLoading ? 'Invio in corso...' : 'Invia Richiesta di Reso'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default NuovoReso;