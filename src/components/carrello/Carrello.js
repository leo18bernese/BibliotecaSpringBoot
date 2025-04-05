// src/components/SearchBooks.js
import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import Cookies from "js-cookie";
import {UserContext} from "../user/UserContext";

const API_URL = 'http://localhost:8080/api/images';

const Carrello = () => {

    const {user} = useContext(UserContext);
    console.log(user);
    const [carrello, setCarrello] = useState([]);

    useEffect(() => {
        if (user) {
            const fetchCarrello = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/carrello/${user.id}`, {
                        headers: {
                            Authorization: `Bearer ${Cookies.get('token')}`
                        }
                    });
                    setCarrello(response.data);
                } catch (error) {
                    console.error('Error fetching carrello:', error);
                }
            };

            fetchCarrello();
        }

    }, [user]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Carrello</h1>
            {carrello.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {carrello.map((item) => (
                        <div key={item.id} className="bg-white shadow-md rounded-lg p-4">
                            <h2 className="text-xl font-semibold">{item.titolo}</h2>
                            <p className="text-gray-700">{item.autore}</p>
                            <p className="text-gray-500">{item.prezzo} €</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Il carrello è vuoto.</p>
            )}
        </div>
    );
}

export default Carrello;