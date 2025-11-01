import {NavLink, Outlet, useLocation} from "react-router-dom";
import React, {useState} from "react";

const AdminBar = () => {
    const location = useLocation();
    const [showSidebar, setShowSidebar] = useState(false);

    const renderMenuItem = (path, label, icon) => (
        <li className="hover:underline">
            {icon && <i className={icon + " mr-1 mb-4"}></i>}

            <NavLink
                to={path}
                className={(location.pathname.startsWith(path) ? "underline" : "" )}
                onClick={() => setShowSidebar(false)}
            >
                {label}
            </NavLink>
        </li>
    );

    const renderSeparator = () => (
        <div className="border-t border-red-200 mb-2"></div>
    );

    const renderEmptyLine = () => (
        <div className="mb-4"></div>
    );

    return (
        <div className="flex flex-col md:flex-row ">

            <button
                className="md:hidden w-full  bg-red-500 text-white p-2 rounded"
                onClick={() => setShowSidebar(true)}
            >
                &#9776; Admin
            </button>

            <div className={`admin-bar bg-red-500 text-red-100 pl-2 pt-4 pr-20 w-64 fixed top-0 left-0 z-30 transition-transform duration-300
                ${showSidebar ? "translate-x-0" : "-translate-x-full"} md:static md:translate-x-0 md:w-5/12 lg:w-3/12 `}>

                <h3 className="text-2xl font-semibold">Admin Panel</h3>
                {renderSeparator()}
                <ul className="text-xl ">

                    <li className="hover:underline mb-8">
                        <NavLink
                            to="/admin"
                        >
                            Dashboard
                        </NavLink>
                    </li>

                    {renderMenuItem("/admin/category", "Manage Categories", 'bxr bxs-folder')}
                    {renderMenuItem("/admin/book", "Manage Books", 'bxr bxs-book')}
                    {renderEmptyLine()}
                    {renderMenuItem("/admin/order", "Manage Orders", 'bxr bxs-cart')}
                    {renderMenuItem("/admin/reso", "Manage Returns", 'bxr bxs-package')}
                    {renderMenuItem("/admin/user", "Manage Users", 'bxr bxs-user')}
                </ul>
            </div>

            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            <div className="w-5/6 mx-10 overflow-x-auto">
                <Outlet/>
            </div>
        </div>
    );
};

export default AdminBar;
