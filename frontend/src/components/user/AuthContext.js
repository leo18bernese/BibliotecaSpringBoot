import React, {createContext, useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
    const [prompt, setPrompt] = useState(false);
    const navigate = useNavigate();

    const showLoginPrompt = () => setPrompt(true);
    const hideLoginPrompt = () => setPrompt(false);

    const handleLoginRedirect = () => {
        hideLoginPrompt();
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{showLoginPrompt}}>
            {children}
            {prompt && (
                <LoginPromptModal
                    onClose={hideLoginPrompt}
                    onConfirm={handleLoginRedirect}
                />
            )}
        </AuthContext.Provider>
    );
};

const LoginPromptModal = ({onClose, onConfirm}) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg text-center shadow-lg">

                <h3 className="mt-0 text-gray-700 text-xl font-semibold">Login Richiesto</h3>
                <p className="mt-2 text-gray-600">Per favore, effettua il login per continuare.</p>

                <div className="mt-4 space-x-4 transition">
                    <button
                        onClick={onConfirm}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    >
                        Login
                    </button>

                    <button
                        onClick={onClose}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded "
                    >
                        Annulla
                    </button>
                </div>
            </div>
        </div>
    );
};