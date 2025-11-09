import {useContext} from "react";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {UserContext} from "../../../user/UserContext";

const trackEvent = async (productId, user, type) => {
    try {
        const formData = new FormData();
        formData.append('productId', productId);

        if(user) formData.append('userId', user.id);

        formData.append('eventType', type);

        await axios.post('/api/analytics/events', formData);
        console.log(`Impressione tracciata con successo per il prodotto: ${productId}`);
    } catch (error) {
        console.error(`Errore nel tracciamento dell'impressione per il prodotto: ${productId}`, error);
        throw error;
    }
};


export const fetchTopItems = async (type, complete = false ) => {
    console.log(`Fetching top items of type: ${type}`);

    const amount = complete ? "ids" : "top3";

    const {data} = await axios.get(`/api/rankings/${type}/${amount}`);
    return data;
}

export const fetchTopItemsContent = async (type) => {
    const {data} = await axios.get(`/api/rankings/${type}/content`);
    return data;
}

export const useAnalyticsMutation = () => {
    const {user} = useContext(UserContext);

    const addEventMutation = useMutation({
        mutationFn: async ({productId, eventType}) => {
            if(!user) return;

            return await trackEvent(productId, user, eventType);
        },
        onError: (error) => {
            console.error('Error tracking event:', error);
        },
        onSuccess: (data, variables) => {
            console.log('Event tracked successfully for product:', variables.productId);
        }
    });

    return {
        addEventMutation,
    }
}