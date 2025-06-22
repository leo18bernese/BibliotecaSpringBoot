import React, { useContext } from 'react';
import axios from 'axios';
import { UserContext } from "../user/UserContext";
import { useQuery } from "@tanstack/react-query";
import CarrelloItem from "./CarrelloItem"; // Import the new component

const fetchCarrelloByUserId = async (userId) => {
    if (!userId) {
        return [];
    }
    const { data } = await axios.get(`http://localhost:8080/api/carrello/items`);
    console.log(data);
    return data;
};

const Carrello = () => {
    const { user } = useContext(UserContext);

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
                <div className="grid grid-cols-1  gap-5 ">
                    {carrello.map((item) => (
                        <CarrelloItem key={item.libroId} item={item} />
                    ))}
                </div>
            ) : (
                <p>Il carrello è vuoto.</p>
            )}
        </div>
    );
};

export default Carrello;