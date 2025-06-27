import React, {createContext, useContext} from 'react';
import axios from 'axios';
import {UserContext} from "../user/UserContext";
import toast from "react-hot-toast";
import {useQueryClient} from "@tanstack/react-query";

export const CartContext = createContext();

export const CartProvider = ({children}) => {
    const {user} = useContext(UserContext);
    const queryClient = useQueryClient();

    const addItem = async (itemId, quantity) => {
        if (!user) {
            console.error("User not logged in");
            return;
        }

        const requestBody = {
            libroId: itemId,
            quantita: quantity
        };

        try {
            const response = await axios.post(`/api/carrello/items`, requestBody);

            if (response.status === 200) {
                toast.success("Elemento aggiunto al carrello con successo!");
                await queryClient.invalidateQueries(['book', itemId]);
            }

            return response;
        } catch (error) {
            toast.error(error.response.data || "Errore durante l'aggiunta dell'elemento al carrello");
            console.log(error.response.data || "Errore durante l'aggiunta dell'elemento al carrello"); // You can keep this for debugging if needed
        }

    };

    const removeItem = async (itemId, quantity) => {
        if (!user) {
            console.error("User not logged in");
            return;
        }

        const requestBody = {
            libroId: itemId,
            quantita: quantity
        };

        try {
            const response = await axios.delete(`/api/carrello/items`, { data: requestBody });

            if (response.status === 200) {
                toast.success("Elemento rimosso dal carrello con successo!");
                await queryClient.invalidateQueries(['book', itemId]);
            }

            return response;
        } catch (error) {
            console.error("Error removing item to cart:", error);
            toast.error(error.response.data || "Errore durante la rimozione dell'elemento dal carrello");
            throw error;
        }

    };

    return (

        <CartContext.Provider value={{addItem, removeItem}}>
            {children}

        </CartContext.Provider>
    );
}