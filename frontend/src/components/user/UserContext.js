import React, {createContext, useState, useEffect} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAndSetUser = async (jwtToken) => {
        if (!jwtToken) {
            setIsLoading(false);
            return;
        }

        console.log("Token trovato, provo a validarlo.");
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

        try {
            const userResponse = await axios.get("/api/utenti/current");
            setUser(userResponse.data);
            console.log("Utente validato con successo:", userResponse.data);
        } catch (error) {
            console.error("Token non valido o scaduto:", error.response?.data || error.message);
            Cookies.remove('jwt-token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const jwtToken = Cookies.get('jwt-token');
        fetchAndSetUser(jwtToken);
    }, []);

    const logout = () => {
        Cookies.remove('jwt-token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const authContextValue = {
        user,
        setUser,
        isLoading,
        fetchAndSetUser, // Esponi la nuova funzione
        logout, // Esponi anche la funzione di logout
    };

    if (isLoading) {
        return <div>Caricamento utente...</div>;
    }

    return (
        <UserContext.Provider value={authContextValue}>
            {children}
        </UserContext.Provider>
    );
};