import {Outlet} from "react-router-dom";
import React from "react";

const AdminBar = () => {

    return (
        <div className="flex flex-row ">
            <div className="admin-bar bg-red-400 text-red-100 pl-2 pt-4 pr-20">

                <h3 className="text-2xl font-semibold ">Admin Panel</h3>

                <ul className="text-xl">
                    <li className="hover:underline"><a href="/admin">Dashboard</a></li>

                    <li className="hover:underline">
                        <i className='bxr bxs-book'></i> <a href="/admin/books">Manage Books</a>
                    </li>

                    <li className="hover:underline">
                        <i className='bxr bxs-cart'></i> <a href="/admin/orders">Manage Orders</a>
                    </li>

                    <li className="hover:underline">
                        <i className='bxr bxs-package'></i> <a href="/admin/returns">Manage Returns</a>
                    </li>

                    <li className="hover:underline">
                        <i className='bxr bxs-user'></i> <a href="/admin/users">Manage Users</a>
                    </li>

                </ul>
            </div>

            <div className="w-3/4 mx-auto">
                <Outlet/>
            </div>
        </div>
    );
};

export default AdminBar;