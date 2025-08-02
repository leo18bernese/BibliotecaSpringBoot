import {useContext} from "react";
import {UserContext} from "../UserContext";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import toast, {Toaster} from "react-hot-toast";

const Register = () => {

    const {user, fetchAndSetUser} = useContext(UserContext);
    const navigate = useNavigate();

    if (user) {
        navigate("/");
        return null; // Prevent rendering the login component
    }

    const handleLogin = async (e) => {

    }

    return (
        <div className="p-4 w-1/2 mt-4 mb-6 mx-auto">
            <Toaster/>

            <h2 className="text-2xl font-bold mb-4">Register</h2>

            <p className="text-gray-600">Not implemented yet.</p>
            <p className="text-gray-600">Have already an account? Please <Link to="/login" className="text-gray-700 underline">click here</Link> to login.</p>

        </div>
    );
}

export default Register;