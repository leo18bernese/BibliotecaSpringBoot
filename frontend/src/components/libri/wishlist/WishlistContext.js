import { createContext, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { UserContext } from "../../user/UserContext";
import {useAuth} from "../../user/AuthContext";

const fetchHasWishlisted = async (bookId) => {
    const { data } = await axios.get(`/api/wishlist/has/${bookId}`);
    return data;
};

// Crea il contesto con un valore iniziale di default
export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(UserContext);
    const {showLoginPrompt} = useAuth();
    const queryClient = useQueryClient();

    // Ho inserito `bookId` come prop in `WishlistProvider`
    const addToWishlist = async (bookId) => {
        console.log("user:", user);
        if (!user) {
            showLoginPrompt();
            return;
        }

        try {
            const { data } = await axios.post(`/api/wishlist/${bookId}`);
            await queryClient.invalidateQueries({
                queryKey: ["hasWishlisted", bookId],
            });
            return data;
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            throw error;
        }
    };

    const removeFromWishlist = async (bookId) => {
        if (!user) {
            showLoginPrompt();
            return;
        }
        try {
            const { data } = await axios.delete(`/api/wishlist/${bookId}`);
            await queryClient.invalidateQueries({
                queryKey: ["hasWishlisted", bookId],
            });
            return data;
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            throw error;
        }
    };

    // Utilizzo di useMemo per memorizzare il valore del contesto
    const value = useMemo(
        () => ({
            addToWishlist,
            removeFromWishlist,
        }),
        []
    );

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

// Hook personalizzato per un facile accesso al contesto
export const useWishlist = (bookId) => {
    const context = useContext(WishlistContext);
    const { user } = useContext(UserContext);

    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }

    const {
        data: hasWishlisted,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["hasWishlisted", bookId],
        queryFn: () => fetchHasWishlisted(bookId),
        enabled: !!user,
    });

    const { addToWishlist, removeFromWishlist } = context;

    return {
        hasWishlisted,
        isLoading,
        isError,
        addToWishlist,
        removeFromWishlist,
    };
};