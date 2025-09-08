import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import ButtonField from "./fields/ButtonField";
import {usePageTitle} from "../../utils/usePageTitle";

const fetchBookById = async (id) => {
    const {data} = await axios.get(`/api/libri/${id}`);
    return data;
};

const fetchBookExists = async (id) => {
    if (!id || id <= 0) return false;
    const {data} = await axios.get(`/api/libri/exists/${id}`);
    return data;
};

// Nuova funzione per fetch delle prenotazioni
const fetchPrenotazioni = async (id) => {
    if (!id || id <= 0) return [];
    const {data} = await axios.get(`/api/rifornimento/${id}/prenotazioni`);
    return data.content || [];
};

const AdminBookInventory = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const {data: book, isLoading: isBookLoading, error: bookError} = useQuery({
        queryKey: ['book', id],
        queryFn: () => fetchBookById(id),
    });

    const {data: bookExists, isLoading: isBookExistsLoading, error: bookExistsError} = useQuery({
        queryKey: ['bookExists', id],
        queryFn: () => fetchBookExists(id),
    });

    // Nuova query per le prenotazioni
    const {data: prenotazioni, isLoading: isPrenotazioniLoading, error: prenotazioniError} = useQuery({
        queryKey: ['prenotazioni', id],
        queryFn: () => fetchPrenotazioni(id),
        enabled: !!id
    });

    const [quantity, setQuantity] = useState(0);
    const [prenotatiList, setPrenotatiList] = useState([]);

    const [prezzo, setPrezzo] = useState(0);
    const [sconto, setSconto] = useState({});
    const [scontoType, setScontoType] = useState('percentage');

    const [giorniConsegna, setGiorniConsegna] = useState(0);

    const [showPrenotati, setShowPrenotati] = useState(false);

    // Inizializza gli stati quando book è disponibile
    useEffect(() => {
        if (book) {
            const rifornimento = book.rifornimento || {};
            setQuantity(rifornimento.quantita || 0);
            setPrezzo(rifornimento.prezzo || 0);

            const scontoData = rifornimento.sconto || {};
            if (scontoData.percentuale > 0) {
                setSconto({percentuale: scontoData.percentuale});
                setScontoType('percentage');
            } else if (scontoData.valore > 0) {
                setSconto({valore: scontoData.valore});
                setScontoType('fixed');
            } else {
                setSconto({});
                setScontoType('none');
            }

            setGiorniConsegna(rifornimento.giorniConsegna || 0);
        }
    }, [book]);

    // Aggiorna la lista prenotazioni quando arrivano i dati
    useEffect(() => {
        if (prenotazioni) {
            setPrenotatiList(prenotazioni.map(p => ({
                userId: p.utenteId,
                quantity: p.quantita
            })));
        }
    }, [prenotazioni]);

    // Calcola il prezzo scontato basandosi sul tipo di sconto
    const calcolaPrezzoScontato = () => {
        if (scontoType === 'percentage') {
            const percentuale = sconto.percentuale || 0;
            return (prezzo - (prezzo * percentuale / 100)).toFixed(2);
        } else if (scontoType === 'fixed') {
            const valore = sconto.valore || 0;
            return Math.max(0, prezzo - valore).toFixed(2);
        } else {
            return prezzo.toFixed(2);
        }
    };

    const updateRifornimento = async ({id, bookData}) => {

        {
            prenotatiList && prenotatiList.forEach(prenota => {

                const requestBody = {
                    libroId: id,
                    quantita: prenota.quantity
                };

                const {data} = axios.put(`/api/carrello/set-quantity/${prenota.userId}`, requestBody);
                return data;
            })
        }

        const {data} = await axios.put(`/api/libri/${id}/rifornimento`, bookData);
        return data;
    };

    const priceMutation = useMutation({
        mutationFn: updateRifornimento,
        onSuccess: () => {
            toast.success('Libro aggiornato con successo!');
            queryClient.invalidateQueries({queryKey: ['book', id]});
        },
        onError: (error) => {
            toast.error(`Errore nell'aggiornamento del libro: ${error.response?.data?.message || error.message}`);
        },
    });

    const handleSave = () => {
        const scontoFormatted = scontoType === 'percentage'
            ? {percentuale: sconto.percentuale || 0, valore: 0}
            : {percentuale: 0, valore: sconto.valore || 0};

        const bookData = {
            prezzo: prezzo,
            sconto: scontoFormatted
            // prenotatiMap rimosso
        };

        priceMutation.mutate({id, bookData});
        setHasUnsavedChanges(false);
        navigate("/admin/book/" + id);
    };

    const handleFieldChange = (setterFunction) => (value) => {
        setterFunction(value);
        setHasUnsavedChanges(true);
    };

    const handleScontoTypeChange = (newType) => {
        setScontoType(newType);
        switch (newType) {
            case 'percentage':
                setSconto({percentuale: sconto.percentuale || 0});
                break;
            case 'fixed':
                setSconto({valore: sconto.valore || 0});
                break;
            case 'none':
                setSconto({});
                break;
        }
        setHasUnsavedChanges(true);
    };

    useEffect(() => {
        if (!hasUnsavedChanges) return;
        const handlePopState = (event) => {
            const confirmLeave = window.confirm(
                'Hai modifiche non salvate. Sei sicuro di voler lasciare questa pagina?'
            );
            if (!confirmLeave) {
                window.history.pushState(null, '', window.location.pathname);
            } else {
                setHasUnsavedChanges(false);
            }
        };
        window.history.pushState(null, '', window.location.pathname);
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasUnsavedChanges]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = 'Hai modifiche non salvate. Sei sicuro di voler lasciare questa pagina?';
                return event.returnValue;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    usePageTitle('Book #' + id + ' - Inventory');

    console.log(book);

    if (isBookLoading || isBookExistsLoading || isPrenotazioniLoading) {
        return <div>Loading...</div>;
    }

    if (bookError || bookExistsError || prenotazioniError) {
        return <div>Error loading book data.</div>;
    }

    if (!book || !bookExists) {
        return <div className="p-4">Book not found or does not exist.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-lg font-semibold">Book Inventory Management</h1>
            <p className="text-sm text-gray-500">
                Manage the inventory and storage details of this book. <br/>
                You can edit available quantity, add storage locations, and update stock information. <br/>
                You can also edit the price, create discounts, and manage other inventory-related details.
            </p>


            <div className="mt-8 p-4 bg-gray-50 rounded-md">
                <h2 className="text-md font-semibold rounded-md">Seleziona una variante qui sotto</h2>

                {book.varianti.map((variante) => (
                    console.log(variante) ||
                    <div key={variante.id} className="mt-4 p-4 border rounded-md bg-white">
                        <h3 className="text-md font-semibold mb-2">{variante.nome}</h3>
                        <p className="text-sm text-gray-600 mb-4">{variante.descrizione}</p>

                        <ButtonField key={variante.id}
                                     id={`var-${variante.id}-quantity`}
                                     icon={"book"}
                                     actionText={`Variante ${variante.nome} (global #${variante.id}) `}
                        />
                    </div>
                ))}


            </div>

            <div className="fixed bottom-4 right-4">
                <button
                    onClick={handleSave}
                    className={`px-6 py-3 text-white rounded-lg transition-colors duration-200
                  ${hasUnsavedChanges ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                    disabled={!hasUnsavedChanges}
                >
                    {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
                </button>
            </div>
        </div>
    );
};

export default AdminBookInventory;
