// src/App.js
import React, {useContext} from 'react';
import './App.css';
import NavBar from "./components/navbar/NavBar";
import {BrowserRouter as Router, Navigate, Route, Routes, useParams} from "react-router-dom";
import SearchBooks from "./components/libri/search/SearchBooks";
import BookInfo from "./components/libri/details/BookInfo";
import {UserContext, UserProvider} from './components/user/UserContext';
import Carrello from "./components/carrello/Carrello";
import {CartProvider} from "./components/carrello/CartContext";

import {QueryClient, QueryClientProvider, useQuery} from '@tanstack/react-query';
import ScrollToTop from "./components/utils/ScrollToTop";
import CheckOut from "./components/checkout/CheckOut";
import axios from "axios";
import LiteBook from "./components/libri/lite/LiteBook";
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

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <CartProvider>
                    <Router>
                        <ScrollToTop/>

                        <NavBar/>
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/search" element={<SearchBooks/>}/>

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


                                <Route path="/account" element={<AccountInfo/>}>
                                    <Route index element={<Navigate to="personal-details" replace/>}/>
                                    <Route path="personal-details" element={<PersonalDetails/>}/>
                                    <Route path="orders" element={<OrderHistory/>}/>
                                    <Route path="reviews" element={<ReviewHistory/>}/>
                                    <Route path="wishlist" element={<Wishlist/>}/>
                                    <Route path="shipping" element={<Shipping/>}/>
                                    <Route path="returns" element={<ReturnsHistory/>}/>


                                    {/* <Route path="info" element={<SomeAccountDetailsComponent />} />
                                <Route path="payments" element={<PaymentMethods />} />
                                <Route path="reviews" element={<ProductReviews />} />
                                <Route path="returns" element={<ReturnsRefunds />} />
                                <Route path="settings" element={<AccountSettings />} />
                                <Route path="support" element={<Support />} /> */}
                                </Route>
                            </Route>

                            <Route path="/cart" element={<Carrello/>}/>
                            <Route path="/checkout" element={<CheckOut/>}/>

                            <Route path="/login" element={<Login/>}/>
                            <Route path="/register" element={<Register/>}/>

                            <Route path="/account" element={<AccountInfo/>}>
                                <Route index element={<Navigate to="personal-details" replace/>}/>
                                <Route path="personal-details" element={<PersonalDetails/>}/>
                                <Route path="orders" element={<OrderHistory/>}/>
                                <Route path="reviews" element={<ReviewHistory/>}/>
                                <Route path="wishlist" element={<Wishlist/>}/>
                                <Route path="shipping" element={<Shipping/>}/>
                                <Route path="returns" element={<ReturnsHistory/>}/>


                                {/* <Route path="info" element={<SomeAccountDetailsComponent />} />
                                <Route path="payments" element={<PaymentMethods />} />
                                <Route path="reviews" element={<ProductReviews />} />
                                <Route path="returns" element={<ReturnsRefunds />} />
                                <Route path="settings" element={<AccountSettings />} />
                                <Route path="support" element={<Support />} /> */}
                            </Route>
                        </Routes>
                    </Router>
                </CartProvider>
            </UserProvider>
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

    const {data: homepageItems, isLoading, error} = useQuery({
        queryKey: ['homepageItems'],
        queryFn: fetchHomepageItems,
        staleTime: Infinity, // Impedisce il refetch automatico
    });

    return (
        <div className="App container mx-auto">

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

            <div className="homepage-items grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 p-10">
                {isLoading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error loading items: {error.message}</p>
                ) : (
                    homepageItems.map(item => (
                        <LiteBook bookId={item} key={item}/>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;
