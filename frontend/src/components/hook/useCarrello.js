// src/hooks/useCarrello.js
import { useContext } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { UserContext } from '../user/UserContext';

const fetchCarrelloByUserId = async (userId) => {
    if (!userId) {
        return { items: [], numeroItems: 0, totale: 0 };
    }
    const { data } = await axios.get(`/api/carrello`);
    console.log('Carrello fetched:', data);
    return data;
};

export const useCarrello = () => {
    const { user } = useContext(UserContext);

    const {
        data: carrello,
        isLoading: isLoadingCart,
        error: errorCart,
        isError: isErrorCart
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
        },
    });

    return { carrello, isLoadingCart, errorCart, isErrorCart};
};