import React, {useContext} from 'react';
import {Link, NavLink, Outlet, useParams} from "react-router-dom";
import {UserContext} from "./UserContext";
import {Toaster} from "react-hot-toast";

const linkItem = (emoji, text, to) => (
    <NavLink to={to}
             className={({ isActive }) =>
                 `p-2 rounded flex items-center gap-2.5 ${isActive ? "bg-blue-200 hover:bg-blue-300  font-semibold" : "hover:bg-gray-100"}`
             }>

        <i className={`bx bx-${emoji} text-2xl`}></i>
        {text}
    </NavLink>
);



const AccountInfo = () => {
    const {id} = useParams();

    const {user} = useContext(UserContext);

    console.log(user);

    return (
        <>
            <div className="container mx-auto mt-8 user-info">
                <Toaster/>

                <div className="grid grid-cols-1 lg:grid-cols-[20%_80%] gap-4">

                    <div className="bg-white shadow-md rounded-lg p-4 mb-4 text-black">

                        <div>
                            <h3 className="text-lg mb-4">My Account</h3>
                        </div>

                        <div >
                            {linkItem('user', 'Personal Details', '/account/personal-details')}
                            {linkItem('lock-keyhole-open', 'Security Settings', '/account/security')}
                            {linkItem('package', 'Order History', '/account/orders')}
                            {linkItem('location', 'Shipping Addresses', '/account/shipping')}
                            {linkItem('credit-card', 'Payment Methods', '/account/payments')}
                            {linkItem('heart', 'Wishlist', '/account/wishlist')}
                            {linkItem('star', 'Product Reviews', '/account/reviews')}
                            {linkItem('rotate-ccw', 'Returns & Refunds', '/account/returns')}
                            {linkItem('bell', 'Account Settings', '/account/settings')}
                            {linkItem('help-circle', 'Support', '/account/support')}

                            {linkItem('arrow-out-down-right-stroke-square', 'Logout', '/logout')}
                        </div>
                    </div>

                    <div className="text-gray-700">
                        <Outlet />
                    </div>
                </div>


            </div>
        </>
    )
}

export default AccountInfo;