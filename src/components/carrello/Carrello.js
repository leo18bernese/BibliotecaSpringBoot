import React, {useContext} from 'react';
import axios from 'axios';
import {UserContext} from "../user/UserContext";
import {useQuery} from "@tanstack/react-query";
import CarrelloItem from "./CarrelloItem";
import {Toaster} from "react-hot-toast";
import {useNavigate} from "react-router-dom"; // Import the new component

const fetchCarrelloByUserId = async (userId) => {
    if (!userId) {
        return [];
    }
    const {data} = await axios.get(`/api/carrello/items`);
    return data;
};

const Carrello = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    const {
        data: carrello = [],
        isLoading,
        error,
        isError,
    } = useQuery({
        queryKey: ['carrello', user?.id],
        queryFn: () => fetchCarrelloByUserId(user?.id),
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
        select: (data) => {
            if (data && Array.isArray(data)) {
                return [...data].sort((a, b) => a.dataAggiunta.localeCompare(b.dataAggiunta));
            }
            return data;
        }
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
            <Toaster/>

            <div className="grid grid-cols-1 lg:grid-cols-[80%_20%] gap-4 "style={{ alignItems: 'start' }}>
                <div>
                    {carrello.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 ">
                            {carrello.map((item) => (
                                <CarrelloItem key={item.libroId} item={item}/>
                            ))}
                        </div>
                    ) : (
                        <p>Il carrello è vuoto.</p>
                    )}
                </div>

                <div className="bg-white border-gray-300 border-2 shadow-md rounded-lg p-4 ">
                    {carrello.length <= 0 && (
                        <p className="text-gray-600">Aggiungi qualcosa al tuo carrello!</p>
                    )}

                    {carrello.length > 0 && (
                        <div>
                            <h2 className="text-xl mb-4">
                                Totale ({carrello.length} {carrello.length === 1 ? 'articolo' : 'articoli'}):

                                <span className="text-lg font-semibold"> {
                                    carrello.reduce((total, item) => total + (item.prezzo * item.quantita), 0).toFixed(2)
                                } €</span>
                            </h2>

                            <div className="mt-4 border-t pt-4">
                                <button
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                                    onClick={() => navigate('/checkout', { state: { cart: carrello } })}>
                                    Procedi al Checkout
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>


        </div>
    );
};

export default Carrello;