// src/App.js
import React, {useContext} from 'react';
import './App.css';
import NavBar from "./components/navbar/NavBar";
import {BrowserRouter as Router, Navigate, Route, Routes, useParams} from "react-router-dom";
import BookInfo from "./components/libri/details/BookInfo";
import {UserContext, UserProvider} from './components/user/UserContext';
import Carrello from "./components/carrello/Carrello";
import {CartProvider} from "./components/carrello/CartContext";
import {AuthProvider} from "./components/user/AuthContext";
import './components/user/Auth.css';

import {QueryClient, QueryClientProvider, useQuery} from '@tanstack/react-query';
import ScrollToTop from "./components/utils/ScrollToTop";
import CheckOut from "./components/checkout/CheckOut";
import axios from "axios";
import AccountInfo from "./components/user/AccountInfo";
import OrderHistory from "./components/user/pages/OrderHistory";
import Ordine from "./components/ordine/Ordine";
import 'antd/dist/reset.css'
import PersonalDetails from "./components/user/pages/PersonalDetails";
import NuovaRecensione from "./components/recensioni/NuovaRecensione";
import ReviewHistory from "./components/user/pages/ReviewHistory";
import Wishlist from "./components/user/pages/wishlist/Wishlist";
import Shipping from "./components/user/pages/Shipping";
import Login from "./components/user/login/Login";
import {Toaster} from "react-hot-toast";
import Register from "./components/user/register/Register";
import NuovoReso from "./components/reso/NuovoReso";
import ReturnsHistory from "./components/user/pages/RefundHistory";
import Reso from "./components/reso/Reso";
import ProtectedRoute from "./components/user/login/ProtectedRoute";
import ResoChat from "./components/reso/ResoChat";
import Logout from "./components/user/logout/Logout";
import AdminReso from "./components/admin/reso/AdminReso";
import AdminBar from "./components/admin/AdminBar";
import AdminChat from "./components/admin/reso/chat/AdminChat";
import SearchPage from "./components/libri/search/SearchPage";
import BookDisplay from "./components/libri/BookDisplay";
import AdminBook from "./components/admin/book/AdminBook";
import AdminBookOverview from "./components/admin/book/AdminBookOverview";
import AdminBookImages from "./components/admin/book/AdminBookImages";
import AdminBookInventory from "./components/admin/book/AdminBookInventory";
import {WishlistProvider} from "./components/libri/wishlist/WishlistContext";
import AdminBookVariant from "./components/admin/book/AdminBookVariant";
import Security from "./components/user/pages/Security";
import AdminHome from "./components/admin/AdminHome";
import AdminHomeBook from "./components/admin/book/AdminBookHome";
import AdminBookHome from "./components/admin/book/AdminBookHome";
import AdminUserHome from "./components/admin/user/AdminUserHome";

const queryClient = new QueryClient();


function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AuthProvider>
                    <UserProvider>
                        <CartProvider>
                            <WishlistProvider>
                                <ScrollToTop/>

                                <Toaster position="top-center" reverseOrder={false}/>
                                <NavBar/>
                                <Routes>
                                    <Route path="/" element={<Home/>}/>
                                    <Route path="/ricerca" element={<SearchPage/>}/>

                                    <Route path="/book/:id" element={<BookInfo/>}/>
                                    <Route path="/libri/:id" element={<RedirectToBook/>}/>
                                    <Route path="/book/:id/recensioni/nuova" element={<NuovaRecensione/>}/>
                                    <Route path="/libro/:id" element={<RedirectToBook/>}/>

                                    <Route path="/ordine/:id" element={<Ordine/>}/>
                                    <Route path="/ordine/:id/reso/nuovo" element={<NuovoReso/>}/>

                                    <Route element={<ProtectedRoute/>}>
                                        <Route path="/book/:id/recensioni/nuova" element={<NuovaRecensione/>}/>
                                        <Route path="/ordine/:id" element={<Ordine/>}/>
                                        <Route path="/ordine/:id/reso/nuovo" element={<NuovoReso/>}/>
                                        <Route path="/reso/:id" element={<Reso/>}/>
                                        <Route path="/reso/:id/chat" element={<ResoChat/>}/>


                                        <Route path="/account/*" element={<AccountInfo/>}>
                                            <Route index element={<Navigate to="personal-details" replace/>}/>
                                            <Route path="personal-details" element={<PersonalDetails/>}/>
                                            <Route path="orders" element={<OrderHistory/>}/>
                                            <Route path="reviews" element={<ReviewHistory/>}/>
                                            <Route path="wishlist" element={<Wishlist/>}/>
                                            <Route path="shipping" element={<Shipping/>}/>
                                            <Route path="returns" element={<ReturnsHistory/>}/>
                                            <Route path="security" element={<Security/>}/>
                                        </Route>


                                    </Route>

                                    <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN"/>}>
                                        <Route element={<AdminBar/>}>

                                            <Route path="/admin" element={<AdminHome/>}/>

                                            <Route path="/admin/reso/:id" element={<AdminReso/>}/>
                                            <Route path="/admin/reso/:id/chat" element={<AdminChat/>}/>

                                            <Route path="/admin/book" element={<AdminBookHome/>}/>
                                            <Route path="/admin/book/:id" element={<AdminBookOverview/>}/>
                                            <Route path="/admin/book/:id/edit" element={<AdminBook/>}/>
                                            <Route path="/admin/book/:id/images" element={<AdminBookImages/>}/>
                                            <Route path="/admin/book/:id/inventory" element={<AdminBookInventory/>}/>
                                            <Route path="/admin/book/:id/inventory/variante/:varianteId"
                                                   element={<AdminBookVariant/>}/>

                                            <Route path="/admin/users" element={<AdminUserHome />}/>


                                        </Route>
                                    </Route>


                                    <Route path="/cart" element={<Carrello/>}/>
                                    <Route path="/checkout" element={<CheckOut/>}/>

                                    <Route path="/login" element={<Login/>}/>
                                    <Route path="/register" element={<Register/>}/>
                                    <Route path="/logout" element={<Logout/>}/>
                                </Routes>
                            </WishlistProvider>
                        </CartProvider>
                    </UserProvider>
                </AuthProvider>
            </Router>
        </QueryClientProvider>
    );
}

function RedirectToBook() {
    const {id} = useParams();
    return <Navigate to={`/book/${id}`} replace/>;
}

const fetchHomepageItems = async () => {
    const {data} = await axios.get("/api/home/libri");
    return data;
}

function Home() {
    const {user} = useContext(UserContext);

    const {data: homepageIds, isLoading, error} = useQuery({
        queryKey: ['homepageItems'],
        queryFn: fetchHomepageItems,
        staleTime: Infinity, // Impedisce il refetch automatico
    });

    return (
        <div className=" container mx-auto">

            <Toaster/>

            <header className="App-header ">

                {!user ? (
                    <div className="user-info">
                        <h3 className="text-gray-700">Login to see your information</h3>
                    </div>
                ) : (
                    <div className="user-info">
                        <h3 className="text-gray-700">Welcome back, {user.username}!</h3>
                    </div>
                )}
            </header>

            <BookDisplay idList={homepageIds} isLoading={isLoading} error={error}/>

        </div>
    );
}

export default App;
