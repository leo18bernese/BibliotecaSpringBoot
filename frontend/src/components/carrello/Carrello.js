import React, {useContext} from 'react';
import axios from 'axios';
import {UserContext} from "../user/UserContext";
import {useQuery} from "@tanstack/react-query";
import CarrelloItem from "./CarrelloItem";
import {Toaster} from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import {useCarrello} from "../hook/useCarrello"; // Import the new component

const Carrello = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    const { carrello, isLoadingCart, errorCart, isErrorCart } = useCarrello();

    if (isLoadingCart) {
        return (
            <div className="container mx-auto p-4 flex justify-center items-center h-48">
                Caricamento carrello...
            </div>
        );
    }

    if (isErrorCart) {
        return (
            <div className="container mx-auto p-4 text-red-600">
                Errore durante il caricamento del carrello: {errorCart.message}
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Carrello</h1>
                <p>Effettua il login per visualizzare il tuo carrello.</p>
            </div>
        );
    }

    console.log('Carrello:', carrello);

    const cartItems = carrello.items;
    const quantity = carrello.numeroItems;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Carrello</h1>
            <Toaster/>

            <div className="grid grid-cols-1 lg:grid-cols-[80%_20%] gap-4 " style={{alignItems: 'start'}}>
                <div>
                    {cartItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 ">
                            {cartItems.map((item) => (
                                <CarrelloItem key={item.libroId} item={item}/>
                            ))}
                        </div>
                    ) : (
                        <p>Il carrello è vuoto.</p>
                    )}
                </div>

                <div className="bg-white border-gray-300 border-2 shadow-md rounded-lg p-4 ">
                    {quantity <= 0 && (
                        <p className="text-gray-600">Aggiungi qualcosa al tuo carrello!</p>
                    )}

                    {quantity > 0 && (
                        <div>
                            <h2 className="text-xl mb-4">
                                Totale ({quantity} {quantity === 1 ? 'articolo' : 'articoli'}):

                                <span className="text-lg font-semibold"> {
                                    carrello.totale.toFixed(2)
                                } €</span>
                            </h2>

                            <div className="mt-4 border-t pt-4">
                                <button
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                                    onClick={() => navigate('/checkout')}>
                                    Procedi al Checkout
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>


        </div>
    );
};

export default Carrello;