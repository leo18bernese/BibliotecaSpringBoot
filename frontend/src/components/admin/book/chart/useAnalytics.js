import {createContext, useContext} from "react";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";

const trackImpression = async (productId, type) => {
    try {
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('eventType', type);

        await axios.post('/api/analytics/events', formData);
        console.log(`Impressione tracciata con successo per il prodotto: ${productId}`);
    } catch (error) {
        console.error(`Errore nel tracciamento dell'impressione per il prodotto: ${productId}`, error);
        throw error;
    }
};

export const useAnalyticsMutation = () => {

    const addEventMutation = useMutation({
        mutationFn: async ({productId, eventType}) => {
            return await trackImpression(productId, eventType);
        },
        onError: (error) => {
            console.error('Error tracking event:', error);
        },
        onSuccess: (data, variables) => {
            console.log('Event tracked successfully for product:', variables.productId);
        }
    });

    return {
        addEventMutation
    }
}