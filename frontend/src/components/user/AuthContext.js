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

const LoginPromptModal = ({onClose, onConfirm}) => (
    <div className="auth-modal-overlay">
        <div className="auth-modal">
            <h3>Login Richiesto</h3>
            <p>Per favore, effettua il login per continuare.</p>
            <button onClick={onConfirm}>Login</button>
            <button onClick={onClose}>Annulla</button>
        </div>
    </div>
);

