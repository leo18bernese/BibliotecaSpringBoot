// src/App.js
import React, {useContext} from 'react';
import './App.css';
import NavBar from "./components/navbar/NavBar";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import SearchBooks from "./components/libri/search/SearchBooks";
import BookInfo from "./components/libri/details/BookInfo";
import {UserContext, UserProvider} from './components/user/UserContext';
import Carrello from "./components/carrello/Carrello";
import {CartProvider} from "./components/carrello/CartContext";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScrollToTop from "./components/utils/ScrollToTop";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
        <UserProvider>
            <CartProvider>
                <Router>
                    <ScrollToTop />

                    <NavBar/>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/search" element={<SearchBooks/>}/>
                        <Route path="/libri/:id" element={<BookInfo/>}/>
                        <Route path="/account" element={<div>Account</div>}/>
                        <Route path="/cart" element={<Carrello/>}/>
                    </Routes>
                </Router>
            </CartProvider>
        </UserProvider>
        </QueryClientProvider>
    );
}

function Home() {
    const {user} = useContext(UserContext);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Libri List</h1>
                {!user ? (
                    <div className="user-info">
                        <h3>Login to see your information</h3>
                    </div>
                ) : (
                    <div className="user-info">
                        <h3>Welcome, {user.username}!</h3>
                    </div>
                )}
            </header>
        </div>
    );
}

export default App;
