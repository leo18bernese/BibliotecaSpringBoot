// src/App.js
import React, {useEffect, useState} from 'react';
import './App.css';
import NavBar from "./components/navbar/NavBar";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import SearchBooks from "./components/libri/search/SearchBooks";
import BookInfo from "./components/libri/details/BookInfo";
import Cookies from 'js-cookie';
import axios from "axios";


async function getCsrfToken() {
    try {
        const response = await axios.get("http://localhost:8080/csrf-token");

        const token = response.data;
        Cookies.set("csrftoken", token.token);
        console.log("Token salvato:", token);
    } catch (error) {
        console.error("Errore di login:", error.response?.data || error.message);
    }

    return Cookies.get('csrftoken');
}

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const csrfToken = await getCsrfToken();
            if (csrfToken) {
                axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken;
            } else {
                console.error('CSRF token not found');
            }

            try {
                const response = await axios.post("/api/auth/login", {
                    username: "Daniel18",
                    password: "ciao1234"
                }, {
                    headers: {
                        'X-XSRF-TOKEN': csrfToken
                    }
                });

                console.log("Login response:", response.data);

                if (response.data) {
                    setUser(response.data);
                    Cookies.set('XSRF-TOKEN', response.data.token);
                }
            } catch (error) {
                console.error("Login error:", error.response?.data || error.message);
            }
        };

        fetchUser();
    }, []);

    return (
        <Router>
            <NavBar/>
            <Routes>
                <Route path="/" element={
                    <div className="App">
                        <header className="App-header">
                            <h1>Libri List</h1>

                            {!user && (
                                <div className={"user-info"}>
                                    <h3>Login to see your information</h3>
                                </div>
                            )}

                            {user && (
                                <div className={"user-info"}>
                                    <h3>Welcome, {user.username}!</h3>
                                </div>
                            )}
                        </header>


                    </div>
                }/>
                <Route path="/search" element={<SearchBooks/>}/>
                <Route path="/libri/:id" element={<BookInfo/>}/>
            </Routes>


        </Router>
    );
}

export default App;