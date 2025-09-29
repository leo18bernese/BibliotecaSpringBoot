import {useContext} from "react";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {UserContext} from "../../../user/UserContext";

const trackImpression = async (productId, user, type) => {
    try {
        const formData = new FormData();
        formData.append('productId', productId);

        {
            user && formData.append('userId', user.id);
        }

        formData.append('eventType', type);

        await axios.post('/api/analytics/events', formData);
        console.log(`Impressione tracciata con successo per il prodotto: ${productId}`);
    } catch (error) {
        console.error(`Errore nel tracciamento dell'impressione per il prodotto: ${productId}`, error);
        throw error;
    }
};

export const useAnalyticsMutation = () => {
    const {user} = useContext(UserContext);

    const addEventMutation = useMutation({
        mutationFn: async ({productId, eventType}) => {
            return await trackImpression(productId, user, eventType);
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