import React, {useContext} from "react";
import {UserContext} from "../UserContext";
import {Toaster} from "react-hot-toast";
import {Link, useLocation, Outlet} from "react-router-dom";

const getDeniedContainer = (emoji, title, message, buttonText, buttonLink, state) => (
    <div className="container text-center mx-auto mt-8">
        <Toaster/>
        <i className={"bx " + emoji} style={{color: '#c22b2b', fontSize: '82px'}}></i>
        <div className="p-4 text-gray-700">

            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-gray-700">{message}</p>

            <Link to={buttonLink} state={state} className="text-gray-700 underline">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold">
                    {buttonText}
                </button>
            </Link>
        </div>
    </div>
);

const ProtectedRoute = ({children, requiredRole}) => {
    const {user} = useContext(UserContext);
    const location = useLocation();

    if (!user) {
        return (
            getDeniedContainer( 'bxs-no-entry',
                'Accesso Negato',
                'Devi essere loggato per visualizzare questa pagina.',
                'Clicca qui per accedere',
                '/login',
                { from: location }
            )
        );
    }

    if (requiredRole && (!user.ruoli || !user.ruoli.includes(requiredRole))) {
        return (
            getDeniedContainer('bxs-user-x',
                'Autorizzazione Negata',
                'Non hai i permessi necessari per visualizzare questa pagina.',
                'Torna alla Home',
                '/',
                { from: location }
            )
        );
    }

    return children ? children : <Outlet/>;
};

export default ProtectedRoute;