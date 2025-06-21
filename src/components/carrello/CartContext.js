import React, {createContext, useState, useEffect, useContext} from 'react';
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
            console.error("Error adding item to cart:", error);
            toast.error(error.response.data || "Errore durante l'aggiunta dell'elemento al carrello");
            throw error;
        }

    };

    return (

        <CartContext.Provider value={{addItem}}>
            {children}

        </CartContext.Provider>
    );
}