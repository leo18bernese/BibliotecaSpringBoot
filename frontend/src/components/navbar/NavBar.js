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
    const {user, isAdmin, isAdminMode, toggleAdminMode} = useContext(UserContext);
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

            redirectToSearch();
        }
    };

    const redirectToSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/ricerca?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery(''); // Opzionale: pulisce l'input dopo la ricerca
        }
    };

    const getLinkClass = (path, name, otherPaths, condition = true, separator = false) => {
        if (!condition) return null;

        const paths = otherPaths ? [path, ...otherPaths] : [path];
        const isActive = paths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

        return (
            <div className="hidden md:block" key={name}>
                {separator && <span className="mx-1 text-gray-800">|</span>}

                <Link
                    to={path}
                    className={`font-medium py-2 px-1 rounded-md border-2 transition-colors 
                    ${isActive
                        ? 'border-gray-500 bg-gray-300 font-semibold'
                        : 'border-transparent hover:border-gray-500 hover:bg-gray-300'}
                `}
                >
                    {name}
                </Link>
            </div>
        );
    };

    return (
        <nav className="bg-gray-100 text-gray-800 shadow-md ">
            <div className="container mx-auto  px-4 py-3 ">

                <div className="flex flex-col space-y-3 md:space-y-2 ">
                    <div className="flex flex-col md:flex-row  justify-between items-center">
                        <div className="text-lg md:text-2xl font-bold text-gray-700">
                            <Link to="/">Dani Commerce</Link>
                        </div>

                        {/* Left side - Navigation links */}
                        <ul className="flex space-x-2 list-none m-0 p-0 items-center">
                            {getLinkClass('/', 'Home')}
                            {getLinkClass('/prodotti', 'Prodotti')}
                            {getLinkClass('/categories', 'Categorie', ['/category'])}
                            {getLinkClass('/contatti', 'Contatti')}
                            {getLinkClass('/admin', 'Admin', null, user && user.ruoli.includes('ROLE_ADMIN'), true)}
                        </ul>

                        {/* Right side - Search bar and user/cart links */}
                        <div className="mx-2 flex items-center space-x-4">


                            <div className="flex items-center space-x-4">

                                {user ? (
                                    <Link
                                        to="/account"
                                        className={`border-2 p-2 rounded-md transition-colors 
                                    ${location.pathname.startsWith('/account')
                                            ? 'border-gray-500 bg-gray-300  font-semibold'
                                            : 'border-transparent hover:border-gray-500 hover:bg-gray-300'}
                                `}
                                    >
                                        {user.username}
                                    </Link>
                                ) : (
                                    <Link to="/login" state={{from: location}}
                                          className={`border-2 p-2 rounded-md transition-colors
                                    ${location.pathname === '/login'
                                              ? 'border-gray-500 bg-gray-300 font-semibold'
                                              : 'border-transparent hover:border-gray-500 hover:bg-gray-300'}
                                `}>
                                        Login
                                    </Link>
                                )}

                                {isAdmin() && (
                                    <div onClick={toggleAdminMode}
                                         className={`relative w-12 cursor-pointer rounded-full h-6 
                                 p-1 text-center text-sm font-medium transition-colors 
                                 ${isAdminMode() ? 'bg-green-500' : 'bg-gray-300'}`}>

                                        <div className={`absolute top-0 left-0 h-full w-1/2 rounded-full 
                                bg-white shadow-md 
                                transition-transform ${isAdminMode() ? 'translate-x-full' : ''}`}>

                                        </div>

                                    </div>
                                )}

                                <Link to="/cart" className="hover:text-gray-600 relative">
                                    <FaShoppingCart size={24}/>

                                    {/* Optional: Add a badge for cart items count */}
                                    <span
                                        className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {carrello}
                        </span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="w-1/3 mx-auto flex flex-row ">
                        <input
                            type="text"
                            placeholder={"Cerca..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="w-full px-4 py-2 rounded-l-md border border-gray-400
                            bg-gray-200 focus:outline-none  focus:ring-gray-500"
                        />

                        <button onClick={ () =>redirectToSearch()}
                                className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
                        >
                            <i className='bxr bx-search'></i>
                        </button>
                    </div>
                </div>

            </div>
        </nav>
    );
};

export default NavBar;