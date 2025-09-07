import React, {useContext, useState} from "react";
import {UserContext} from "../UserContext";
import {Link, useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import toast, {Toaster} from "react-hot-toast";
import {useMutation} from "@tanstack/react-query";

const Register = () => {

    const {user, fetchAndSetUser} = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState(''); // Nuovo stato per l'errore email

    const registerMutation = useMutation({
        mutationFn: async ({username, password, nome, cognome, email}) => {
            return axios.post("/api/auth/register", {username, password, nome, cognome, email});
        },
        onSuccess: async (data) => {
            toast.success("Registration successful!");
            navigate(from, {replace: true});
        },
        onError: (error) => {
            console.error("Errore durante la registrazione:", error.response?.data.errore || error.message);
            toast.error(error.response?.data?.errore || "Registration failed");
        }
    });

    // Regex per la validazione dell'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleRegister = async (e) => {
        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;
        const nome = e.target.nome.value;
        const cognome = e.target.cognome.value;
        const email = e.target.email.value;

        // Validazione del formato dell'email
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        setEmailError(''); // Pulisci l'errore se la validazione ha successo
        registerMutation.mutate({username, password, nome, cognome, email});
    }

    if (user) {
        navigate("/");
        return null;
    }

    return (
        <div className="p-4 lg:w-1/2 w-3/4 mt-4 mb-6 mx-auto">
            <Toaster/>

            <h2 className="text-2xl font-bold mb-4">Register</h2>

            <p className="text-gray-600">Have already an account? Please <Link to="/login" className="text-gray-700 underline">click here</Link> to login.</p>

            <form className="mt-10" onSubmit={handleRegister}>
                <div>
                    <label htmlFor="nome" className="block text-gray-700 text-sm font-bold mb-2 ">
                        Name
                    </label>
                    <input
                        type="text"
                        id="nome"
                        name="nome"
                        placeholder="Your first name"
                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        required/>
                </div>

                <div>
                    <label htmlFor="cognome" className="block text-gray-700 text-sm font-bold mb-2 mt-3">
                        Cognome
                    </label>
                    <input
                        type="text"
                        id="cognome"
                        name="cognome"
                        placeholder="Your last name"
                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        required/>
                </div>

                <div>
                    <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2 mt-3">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Choose a username"
                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        required/>
                </div>

                <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2 mt-3">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        className={`shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${emailError ? 'border-red-500' : ''}`} // Aggiunge classe di errore
                        required/>
                    {emailError && ( // Mostra il messaggio di errore se lo stato non è vuoto
                        <p className="text-red-500 text-xs italic mt-1">{emailError}</p>
                    )}
                </div>

                <div className="relative ">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2 mt-3">
                        Password
                    </label>

                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Create a strong password"
                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required/>

                    <div className="absolute top-8 right-0 pr-3 flex items-center text-sm leading-5">
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500">
                            <i className={`bx bx-${showPassword ? "eye-slash" : "eye"} text-xl`}></i>
                        </button>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={registerMutation.isLoading}
                    >
                        {registerMutation.isLoading ? "Registering..." : "Register"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Register;