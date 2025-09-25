import React, {useContext, useState} from 'react';
import {NavLink, Outlet, useParams} from "react-router-dom";
import {UserContext} from "./UserContext";
import {Toaster} from "react-hot-toast";

const linkItem = (emoji, text, to, onClick) => (
    <NavLink to={to}
             className={({isActive}) =>
                 `p-2 rounded flex items-center gap-2.5 ${isActive ? "bg-blue-200 hover:bg-blue-300  font-semibold" : "hover:bg-gray-100"}`
             }
             onClick={onClick}
    >
        <i className={`bx bx-${emoji} text-2xl`}></i>
        {text}
    </NavLink>
);

const AccountInfo = () => {
    const {id} = useParams();
    const {user} = useContext(UserContext);
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
            <div className="container mx-auto mt-8 user-info">
                <Toaster/>

                {/* Pulsante mobile per aprire la sidebar */}
                <button
                    className="lg:hidden w-full bg-blue-500 text-white p-2 rounded mb-4"
                    onClick={() => setShowSidebar(true)}
                >
                    &#9776; Opzioni Account
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-[20%_80%] gap-4">

                    {/* Sidebar mobile/desktop */}
                    <div className={`bg-white shadow-md rounded-lg p-4 mb-4 text-black fixed top-0 left-0 z-30 transition-transform duration-300 h-full w-64 lg:static lg:translate-x-0 lg:w-auto lg:h-auto ${showSidebar ? "translate-x-0" : "-translate-x-full"} lg:mb-0`}>
                        <div>
                            <h3 className="text-lg mb-4">My Account</h3>
                        </div>
                        <div className="flex flex-col gap-1">
                            {linkItem('user', 'Personal Details', '/account/personal-details', () => setShowSidebar(false))}
                            {linkItem('lock-keyhole-open', 'Security Settings', '/account/security', () => setShowSidebar(false))}
                            {linkItem('package', 'Order History', '/account/orders', () => setShowSidebar(false))}
                            {linkItem('location', 'Shipping Addresses', '/account/shipping', () => setShowSidebar(false))}
                            {linkItem('credit-card', 'Payment Methods', '/account/payments', () => setShowSidebar(false))}
                            {linkItem('heart', 'Wishlist', '/account/wishlist', () => setShowSidebar(false))}
                            {linkItem('star', 'Product Reviews', '/account/reviews', () => setShowSidebar(false))}
                            {linkItem('rotate-ccw', 'Returns & Refunds', '/account/returns', () => setShowSidebar(false))}
                            {linkItem('bell', 'Account Settings', '/account/settings', () => setShowSidebar(false))}
                            {linkItem('help-circle', 'Support', '/account/support', () => setShowSidebar(false))}
                            {linkItem('arrow-out-down-right-stroke-square', 'Logout', '/logout', () => setShowSidebar(false))}
                        </div>
                    </div>

                    {/* Overlay mobile */}
                    {showSidebar && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-40 z-10 lg:hidden"
                            onClick={() => setShowSidebar(false)}
                        />
                    )}

                    <div className="text-gray-700 lg:ml-0 ml-0">
                        <Outlet/>
                    </div>
                </div>

            </div>
        </>
    )
}

export default AccountInfo;