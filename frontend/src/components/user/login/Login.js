import React, {useContext, useState} from "react";
import { UserContext } from "../UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
    const { user, fetchAndSetUser } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const [showPassword, setShowPassword] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    if(user && !loggedIn) {
        navigate(from, { replace: true }); // Redirect to the previous page or home
        return null;
    }

    const handleLogin = async (e) => {
        console.log("current location:", location);
        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const loginResponse = await axios.post("/api/auth/login", {
                username: username,
                password: password,
            });

            const jwtToken = loginResponse.data.token;
            Cookies.set("jwt-token", jwtToken, { expires: 7 });

            setLoggedIn(true);
            // Update user in context
            await fetchAndSetUser(jwtToken);

            console.log("going to ", from);
            toast.success("Login successful!");
            console.log("User has logged in, sending to ", from);

            navigate(from, { replace: true }); // Redirect to the previous page or home
        } catch (error) {
            console.error("Errore durante il login:", error.response?.data.errore || error.message);
            toast.error(error.response?.data?.errore || "Login failed");
        }
    };

    // Optionally, return null if user is logged in (though this should be handled by a route guard)
    if (user) {
        return null;
    }

    return (
        <div className="p-4 lg:w-1/2 w-3/4 mt-4 mb-6 mx-auto">
            <Toaster />
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <p className="text-gray-600">Please log in to access your account.</p>

            <p className="text-gray-600">
                If you don't have an account, please{" "}
                <Link to="/register" className="text-gray-700 underline">
                    click here
                </Link>{" "}
                to create one.
            </p>

            <form className="mt-10" onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                        Username or Email
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username or email"
                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="relative">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    />

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
                    >
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;