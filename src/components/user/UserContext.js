import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        const authenticateUser = async () => {
            const loginResponse = await axios.post("/api/auth/login", {
                username: "Daniel18",
                password: "ciao1234"
            });

            if (loginResponse.status !== 200) {
                console.error("Errore durante il login:", loginResponse.statusText);
                setIsLoading(false);
                return;
            }

            Cookies.set('jwt-token', loginResponse.data.token, { expires: 7 }); // 7 days expiration
        }

        const validateTokenAndFetchUser = async () => {
            authenticateUser();

            console.log("Controllo il token JWT...");

            const jwtToken = Cookies.get('jwt-token');

            if (!jwtToken) {
                console.log("Nessun token trovato. Utente non loggato.");
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

        validateTokenAndFetchUser();
    }, []);

    const authContextValue = {
        user,
        setUser,
        isLoading, // Esponiamo lo stato di caricamento
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