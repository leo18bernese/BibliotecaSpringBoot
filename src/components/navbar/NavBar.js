// src/components/navbar/NavBar.js
import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {UserContext} from "../user/UserContext";
import {FaShoppingCart} from 'react-icons/fa';
import axios from "axios";
import {useCarrello} from "../hook/useCarrello";
import {useQuery} from "@tanstack/react-query";

const fetchCartItemsCount = async () => {
    const {data} = await axios.get('/api/carrello/count');
    return data;
}

const NavBar = () => {
    const {user} = useContext(UserContext);

    const {data: count, isLoadingCart, errorCart, isErrorCart} = useQuery({
        queryKey: ['cartItemsCount'],
        queryFn: fetchCartItemsCount,
        staleTime: Infinity, // Impedisce il refetch automatico
    });

    const carrello = count || 0; // Default to 0 if count is undefined

    return (
        <nav className="bg-gray-800 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Left side - Navigation links */}
                <ul className="flex space-x-6">
                    <li>
                        <Link to="/" className="text-white hover:text-gray-300 font-medium">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/search" className="text-white hover:text-gray-300 font-medium">
                            Search
                        </Link>
                    </li>
                </ul>

                {/* Right side - User and Cart icons */}
                <div className="flex items-center space-x-4">

                    {user && (
                        <Link to="/account" className="text-white hover:text-gray-300">
                            {user.username}
                        </Link>
                    )}
                    <Link to="/cart" className="text-white hover:text-gray-300 relative">
                        <FaShoppingCart size={24}/>

                        {/* Optional: Add a badge for cart items count */}
                        <span
                            className="absolute -top-2 -right-4 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {carrello}
                        </span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;