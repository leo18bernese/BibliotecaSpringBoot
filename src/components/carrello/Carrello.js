// src/components/Carrello.js (Nota: il nome del file era SearchBooks.js nell'esempio precedente, ma il contenuto era per Carrello)
import React, { useContext } from 'react';
import axios from 'axios';
import { UserContext } from "../user/UserContext";
import { useQuery } from "@tanstack/react-query"; // Importa useQuery

const fetchCarrelloByUserId = async (userId) => {
    // Aggiungi un controllo per userId per evitare richieste non necessarie
    if (!userId) {
        return []; // Restituisce un array vuoto se l'utente non è loggato
    }
    const { data } = await axios.get(`http://localhost:8080/api/carrello/items`);
    console.log(data);
    return data;
};

const Carrello = () => {
    const { user } = useContext(UserContext);

    // Usa useQuery per gestire il fetching del carrello
    const {
        data: carrello = [],
        isLoading,
        error,
        isError,
        isSuccess
    } = useQuery({
        queryKey: ['carrello', user?.id],
        queryFn: () => fetchCarrelloByUserId(user?.id),
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 flex justify-center items-center h-48">
                Caricamento carrello...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto p-4 text-red-600">
                Errore durante il caricamento del carrello: {error.message}
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Carrello</h1>
                <p>Effettua il login per visualizzare il tuo carrello.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Carrello</h1>
            {carrello.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {carrello.map((item) => (
                        <div key={item.id} className="bg-white shadow-md rounded-lg p-4">
                            <h2 className="text-xl font-semibold">{item.titolo}</h2>
                            <p className="text-gray-700">{item.autore}</p>
                            <p className="text-gray-500">{item.prezzo} €</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Il carrello è vuoto.</p>
            )}
        </div>
    );
}

export default Carrello;