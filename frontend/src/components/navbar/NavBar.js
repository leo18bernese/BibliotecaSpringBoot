// src/components/navbar/NavBar.js
import React, {useContext, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {UserContext} from "../user/UserContext";
import {FaShoppingCart} from 'react-icons/fa';
import axios from "axios";
import {useQuery} from "@tanstack/react-query";

const fetchCartItemsCount = async () => {
    const {data} = await axios.get('/api/carrello/count');
    return data;
}

const NavBar = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');

    const {data: count, isLoadingCart, errorCart, isErrorCart} = useQuery({
        queryKey: ['cartItemsCount'],
        queryFn: fetchCartItemsCount,
        staleTime: Infinity, // Impedisce il refetch automatico
        enabled: !!user // Esegui la query solo se l'utente è autenticato
    });

    const carrello = count || 0; // Default to 0 if count is undefined

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchQuery.trim()) {
                navigate(`/ricerca?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery(''); // Opzionale: pulisce l'input dopo la ricerca

            }
        }
    };

    return (
        <nav className="bg-gray-800 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Left side - Navigation links */}
                <ul className="flex space-x-2 list-none m-0 p-0">
                    <li>
                        <Link to="/" className="text-white hover:text-gray-300 font-medium">
                            Home GG
                        </Link>

                        {
                            user && user.ruoli.includes('ROLE_ADMIN') && (
                                <>
                                    <span className="mx-2">|</span>
                                    <Link to="/admin" className="text-white hover:text-gray-300 font-medium">
                                        Admin
                                    </Link>
                                </>
                            )
                        }
                    </li>
                </ul>

                {/* search bar */}
                <div className="mx-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Right side - User and Cart icons */}
                <div className="flex items-center space-x-4">

                    {user ? (
                        <Link to="/account" className="text-white hover:text-gray-300">
                            {user.username}
                        </Link>
                    ) : (
                        <Link to="/login" state={{from: location}} className="text-white hover:text-gray-300">
                            Login
                        </Link>
                    )}
                    <Link to="/cart" className="text-white hover:text-gray-300 relative">
                        <FaShoppingCart size={24}/>

                        {/* Optional: Add a badge for cart items count */}
                        <span
                            className="absolute -top-2 -right-4 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {carrello}
                        </span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;