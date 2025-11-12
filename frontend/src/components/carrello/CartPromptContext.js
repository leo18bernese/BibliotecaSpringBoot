import React, {createContext, useContext, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import { createPortal } from 'react-dom';

// Context per mostrare un pannello a destra (40%) quando si aggiunge un articolo al carrello
const CartPromptContext = createContext();

export const useCartPrompt = () => useContext(CartPromptContext);

export const CartPromptProvider = ({children}) => {
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const showCartPrompt = (id, title, price, addedQuantity) => {
        setItem({ id, title, price, addedQuantity });
        setOpen(true);
    };

    const hideCartPrompt = () => {
        setOpen(false);
        // Rimuoviamo l'item solo dopo che l'animazione di chiusura è terminata
        setTimeout(() => {
            setItem(null);
        }, 300); // La durata deve corrispondere alla durata della transizione
    };

    const goToCart = () => {
        hideCartPrompt();
        navigate('/carrello', {state: {from: location}});
    };

    return (
        <CartPromptContext.Provider value={{showCartPrompt}}>
            {children}

            {item && createPortal(
                <div
                    className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
                >
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-40"
                        onClick={hideCartPrompt}
                    />

                    {/* Pannello a destra */}
                    <aside
                        className={`transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'} w-2/5 h-full bg-white shadow-xl p-6 overflow-auto absolute right-0 top-0 z-50`}
                    >
                        <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Articolo aggiunto al carrello</h3>
                            <button
                                onClick={hideCartPrompt}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Chiudi"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center space-x-4">
                                <img src={item.imageSrc || `/api/images/${item.id}/first`} alt={item.title}
                                     className="w-16 h-16 object-cover rounded-md"/>

                                <div className="flex-1">
                                    <div className="text-gray-800 font-medium">{item.title}</div>
                                    <div className="text-sm text-gray-500 mt-1">Quantità: {item.addedQuantity ?? 1}</div>
                                    {item.price != null && (
                                        <div className="text-sm text-gray-700 mt-1">Prezzo: €{item.price}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <button
                                onClick={goToCart}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                            >
                                Vai al carrello
                            </button>

                            <button
                                onClick={hideCartPrompt}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                            >
                                Continua acquisti
                            </button>
                        </div>

                        <div className="mt-6 text-xs text-gray-500">
                            Puoi visualizzare il carrello in qualsiasi momento per modificare le quantità o procedere al
                            checkout.
                        </div>
                    </aside>
                </div>,
                document.body
            )}
        </CartPromptContext.Provider>
    );
};

