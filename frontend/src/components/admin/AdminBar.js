import {Outlet} from "react-router-dom";
import React from "react";

const AdminBar = () => {

    return (
        <>
            <div className="admin-bar bg-red-400 text-red-100 p-4 flex justify-between">

                <h1 className="text-4xl font-semibold ">ADMIN PANEL</h1>

                <nav className=" flex justify-between items-center">
                    <ul className="flex space-x-4 text-xl">
                        <li><a href="/admin/users">Manage Users</a></li>
                        <li><a href="/admin/settings">Settings</a></li>
                        <li><a href="/admin/reports">Reports</a></li>
                    </ul>
                </nav>
            </div>

            <div className="text-gray-700">
                <Outlet/>
            </div>
        </>
    );
};

export default AdminBar;