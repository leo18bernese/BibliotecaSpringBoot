import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import {CartContext} from "../carrello/CartContext";

export const useCartMutations = () => {
    const queryClient = useQueryClient();
    const { addItem, removeItem, updateItem } = useContext(CartContext);

    const addToCartMutation = useMutation({
        mutationFn: async ({ bookId, varianteId, quantity }) => {
            return await addItem(bookId, varianteId, quantity);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['cartItem', variables.bookId]);
            queryClient.invalidateQueries(['cart']);
        },
        onError: (error) => {
            console.error('Add to cart mutation error:', error);
        }
    });

    const removeFromCartMutation = useMutation({
        mutationFn: async ({ bookId,varianteId, quantity }) => {
            return await removeItem(bookId, varianteId,quantity);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['cartItem', variables.bookId]);
            queryClient.invalidateQueries(['cart']);
        },
        onError: (error) => {
            console.error('Remove from cart mutation error:', error);
        }
    });

    const updateCartItemMutation = useMutation({
        mutationFn: async ({ bookId, varianteId, quantity }) => {
            return await updateItem(bookId, varianteId, quantity);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['cartItem', variables.bookId]);
            queryClient.invalidateQueries(['cart']);
        },
        onError: (error) => {
            console.error('Update cart item mutation error:', error);
        }
    });



    return {
        addToCartMutation,
        removeFromCartMutation,
        updateCartItemMutation
    };
};