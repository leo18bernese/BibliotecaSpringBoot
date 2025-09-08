import {useContext, useEffect} from "react";
import {UserContext} from "../UserContext";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";

const Logout = () => {
    const {user, logout} = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            logout();
            toast.success('Logout successfully');
        }

        navigate('/');
    }, [user, logout, navigate]);


    return null;
}

export default Logout;