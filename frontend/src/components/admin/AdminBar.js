import { Outlet, NavLink, useLocation } from "react-router-dom";
import React from "react";

const AdminBar = () => {
    const location = useLocation();

    const renderMenuItem = (path, label, icon) => (
        <li className="hover:underline">
            {icon && <i className={icon + " mr-1 mb-4"}></i>}

            <NavLink
                to={path}
                className={location.pathname.startsWith(path) ? "underline" : ""}
            >
                {label}
            </NavLink>
        </li>
    );

    return (
        <div className="flex flex-row">
            <div className="admin-bar bg-red-500 text-red-100 pl-2 pt-4 pr-20">
                <h3 className="text-2xl font-semibold">Admin Panel</h3>
                <div className="border-t border-red-200 my-2"></div>
                <ul className="text-xl">

                    <li className="hover:underline mb-4">
                        <NavLink
                            to="/admin"
                        >
                            Dashboard
                        </NavLink>
                    </li>

                    {renderMenuItem("/admin/book", "Manage Books", 'bxr bxs-book')}
                    {renderMenuItem("/admin/orders", "Manage Orders", 'bxr bxs-cart')}
                    {renderMenuItem("/admin/returns", "Manage Returns", 'bxr bxs-package')}
                    {renderMenuItem("/admin/users", "Manage Users", 'bxr bxs-user')}
                </ul>
            </div>

            <div className="w-3/4 mx-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminBar;
