import React, {useContext} from "react";
import {UserContext} from "../UserContext";
import toast, {Toaster} from "react-hot-toast";
import {Link, Navigate, useLocation, Outlet} from "react-router-dom";

const ProtectedRoute = ({children}) => {
    const {user} = useContext(UserContext);
    const location = useLocation();

    if (!user) {
        return (
            <div className="container text-center mx-auto mt-8">
                <Toaster/>

                    <i className='bxr  bxs-no-entry' style={{color: '#c22b2b', fontSize: '82px'}}></i>

                    <div className=" p-4 text-gray-700">
                        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                        <p className="text-gray-700">You must be logged in to view this page.</p>


                        <Link to="/login" state={{from: location}} className="text-gray-700 underline">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold">
                                Click here to login
                            </button>
                        </Link>
                    </div>
            </div>
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;