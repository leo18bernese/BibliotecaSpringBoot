import React, {createContext, useState, useEffect, useContext} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {UserContext} from "../user/UserContext";

export const CartContext = createContext();

export const CartProvider = ({children}) => {
    const {user} = useContext(UserContext);


    const addItem = async (itemId, quantity) => {
        if (!user) {
            console.error("User not logged in");
            return;
        }

        const formData = new FormData();
        formData.append("quantity", quantity);

        const response = await axios.put(`api/carrello/${user.id}/add/${itemId}`,
            formData, {
                headers: {
                    "Authorization": `Bearer ${Cookies.get('XSRF-TOKEN')}`
                }
            });

        if (response.status === 200) {
            console.log("Item added to cart:", response.data);
        }
    };

    return (
        <CartContext.Provider value={{addItem}}>
            {children}
        </CartContext.Provider>
    );
}