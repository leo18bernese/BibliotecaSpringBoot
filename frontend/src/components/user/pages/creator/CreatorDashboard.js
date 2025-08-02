import {useContext} from "react";
import {UserContext} from "../../UserContext";
import {useNavigate} from "react-router-dom";

const CreatorDashboard = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();
}

export default CreatorDashboard;