import React, {useContext} from 'react';
import {BrowserRouter as Router, Link, Navigate, Route, Routes, useLocation, useParams} from "react-router-dom";
import {UserContext, UserProvider} from './components/user/UserContext';
import {CartProvider} from "./components/carrello/CartContext";
import {AuthProvider} from "./components/user/AuthContext";
import {QueryClient, QueryClientProvider, useQuery} from '@tanstack/react-query';
import ScrollToTop from "./components/utils/ScrollToTop";
import {Toaster} from "react-hot-toast";
import NavBar from "./components/navbar/NavBar";
import Home from "./Home";
import SearchPage from "./components/libri/search/SearchPage";
import BookInfo from "./components/libri/details/BookInfo";
import BookPdfDownloader from "./components/admin/book/pdf/BookPdfDownloader";
import CategoryList from "./components/category/list/CategoryList";
import CategoryItems from "./components/category/CategoryItems";
import CategoryForUser from "./components/category/CategoryForUser";
import ProtectedRoute from "./components/user/login/ProtectedRoute";
import NuovaRecensione from "./components/recensioni/NuovaRecensione";
import Ordine from "./components/ordine/Ordine";
import NuovoReso from "./components/reso/NuovoReso";
import Reso from "./components/reso/Reso";
import ResoChat from "./components/reso/ResoChat";
import AccountInfo from "./components/user/AccountInfo";
import PersonalDetails from "./components/user/pages/PersonalDetails";
import PersonalDetailsEdit from "./components/user/pages/edit/PersonalDetailsEdit";
import OrderHistory from "./components/user/pages/OrderHistory";
import ReviewHistory from "./components/user/pages/ReviewHistory";
import Wishlist from "./components/user/pages/wishlist/Wishlist";
import Shipping from "./components/user/pages/Shipping";
import ReturnsHistory from "./components/user/pages/RefundHistory";
import Security from "./components/user/pages/Security";
import AdminBar from "./components/admin/AdminBar";
import AdminHome from "./components/admin/AdminHome";
import AdminResoHome from "./components/admin/reso/AdminResoHome";
import AdminReso from "./components/admin/reso/AdminReso";
import AdminChat from "./components/admin/reso/chat/AdminChat";
import AdminBookHome from "./components/admin/book/AdminBookHome";
import AdminBookOverview from "./components/admin/book/AdminBookOverview";
import AdminBook from "./components/admin/book/AdminBook";
import AdminBookImages from "./components/admin/book/AdminBookImages";
import AdminBookInventory from "./components/admin/book/AdminBookInventory";
import AdminBookVariant from "./components/admin/book/AdminBookVariant";
import AdminUserHome from "./components/admin/user/AdminUserHome";
import AdminUser from "./components/admin/user/AdminUser";
import AdminOrderHome from "./components/admin/order/AdminOrderHome";
import AdminOrder from "./components/admin/order/AdminOrder";
import AdminCategoryHome from "./components/admin/category/AdminCategoryHome";
import AdminCategory from "./components/admin/category/AdminCategory";
import Carrello from "./components/carrello/Carrello";
import CheckOut from "./components/checkout/CheckOut";
import Login from "./components/user/login/Login";
import Register from "./components/user/register/Register";
import Logout from "./components/user/logout/Logout";
import NotFound from "./components/utils/NotFound";
import Footer from "./components/footer/Footer";
import {WishlistProvider} from "./components/libri/wishlist/WishlistContext";
import CategoryItemsFinal from "./components/category/CategoryItemsFinal";

function RedirectToBook() {
    const {id} = useParams();
    return <Navigate to={`/book/${id}`} replace/>;
}

export default function Layout() {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <AuthProvider>
            <UserProvider>
                <CartProvider>
                    <WishlistProvider>
                        <ScrollToTop/>
                        <Toaster position="top-center" reverseOrder={false}/>

                        <div className="flex flex-col min-h-screen">
                            <NavBar/>

                            <main className="flex-1 flex flex-col">
                                <Routes>
                                    <Route path="/" element={<Home/>}/>
                                    <Route path="/ricerca" element={<SearchPage/>}/>

                                    <Route path="/book/:id" element={<BookInfo/>}/>
                                    <Route path="/libri/:id" element={<RedirectToBook/>}/>
                                    <Route path="/libro/:id" element={<RedirectToBook/>}/>
                                    <Route path="/ordine/:id/pdf" element={<BookPdfDownloader/>}/>

                                    <Route path="/categories" element={<CategoryList/>}/>
                                    <Route path="/category/:catId" element={<CategoryItemsFinal/>}/>
                                    <Route path="/category/:catId/user" element={<CategoryItems/>}/>
                                    <Route path="/category/:catId/admin" element={<CategoryForUser/>}/>

                                    <Route element={<ProtectedRoute/>}>
                                        <Route path="/book/:id/recensioni/nuova" element={<NuovaRecensione/>}/>
                                        <Route path="/ordine/:id" element={<Ordine/>}/>
                                        <Route path="/ordine/:id/reso/nuovo" element={<NuovoReso/>}/>
                                        <Route path="/reso/:id" element={<Reso/>}/>
                                        <Route path="/reso/:id/chat" element={<ResoChat/>}/>
                                        <Route path="/account/*" element={<AccountInfo/>}>
                                            <Route index element={<Navigate to="personal-details" replace/>}/>
                                            <Route path="personal-details" element={<PersonalDetails/>}/>
                                            <Route path="personal-details/edit" element={<PersonalDetailsEdit/>}/>
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
                                            <Route path="/admin/reso" element={<AdminResoHome/>}/>
                                            <Route path="/admin/reso/:id" element={<AdminReso/>}/>
                                            <Route path="/admin/reso/:id/chat" element={<AdminChat/>}/>
                                            <Route path="/admin/book" element={<AdminBookHome/>}/>
                                            <Route path="/admin/book/:id" element={<AdminBookOverview/>}/>
                                            <Route path="/admin/book/:id/edit" element={<AdminBook/>}/>
                                            <Route path="/admin/book/:id/images" element={<AdminBookImages/>}/>
                                            <Route path="/admin/book/:id/inventory" element={<AdminBookInventory/>}/>
                                            <Route path="/admin/book/:id/inventory/variante/:varianteId"
                                                   element={<AdminBookVariant/>}/>
                                            <Route path="/admin/user" element={<AdminUserHome/>}/>
                                            <Route path="/admin/user/:id" element={<AdminUser/>}/>
                                            <Route path="/admin/order" element={<AdminOrderHome/>}/>
                                            <Route path="/admin/order/:id" element={<AdminOrder/>}/>
                                            <Route path="/admin/category" element={<AdminCategoryHome/>}/>
                                            <Route path="/admin/category/:id" element={<AdminCategory/>}/>
                                        </Route>
                                    </Route>

                                    <Route path="/cart" element={<Carrello/>}/>
                                    <Route path="/checkout" element={<CheckOut/>}/>
                                    <Route path="/login" element={<Login/>}/>
                                    <Route path="/register" element={<Register/>}/>
                                    <Route path="/logout" element={<Logout/>}/>
                                    <Route path="*" element={<NotFound/>}/>
                                </Routes>
                            </main>

                            {!isAdminPage && <Footer/>}
                        </div>
                    </WishlistProvider>
                </CartProvider>
            </UserProvider>
        </AuthProvider>
    );
}
