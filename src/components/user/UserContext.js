import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            // First get the CSRF token
            try {
                const csrfToken = await getCsrfToken();
                if (csrfToken) {
                    axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken;
                } else {
                    console.error('CSRF token not found');
                    return; // Stop if we don't have a token
                }

                console.log("CSRF token set in axios headers:", csrfToken);

                // Then attempt login
                const loginResponse = await axios.post("/api/auth/login", {
                    username: "Daniel18",
                    password: "ciao1234"
                }, {
                    headers: {
                        'X-XSRF-TOKEN': csrfToken
                    }
                });
                if (loginResponse.data && loginResponse.data.token) {
                    Cookies.set('XSRF-TOKEN', loginResponse.data.token);


                    // After successful login, fetch user data
                    try {
                        const userResponse = await axios.get("/api/utenti/current", {
                            headers: {
                                "Authorization": `Bearer ${loginResponse.data.token}`,
                            }
                        });

                        setUser(userResponse.data);
                    } catch (error) {
                        console.error("Error fetching user:", error.response?.data || error.message);
                    }
                }
            } catch (error) {
                console.error("Authentication error:", error.response?.data || error.message);
            }
        };

        fetchUserData();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

async function getCsrfToken() {
    try {
        // Use relative URL to avoid CORS issues if your API is on the same domain
        const response = await axios.get("/csrf-token");
        console.log("CSRF token set:", response);

        if (response.data && response.data.token) {
            Cookies.set("csrftoken", response.data.token);
            return response.data.token;
        }
    } catch (error) {
        console.error("Error fetching CSRF token:", error.response?.data || error.message);
    }

    return Cookies.get('csrftoken');
}