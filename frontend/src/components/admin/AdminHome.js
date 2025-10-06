import {NavLink} from "react-router-dom";
import {usePageTitle} from "../utils/usePageTitle";

const AdminHome = () => {

    usePageTitle('Admin Dashboard');

    const getLink = (link, color, emoji, text) => {
        return (
            <NavLink to={link}
                     className={`inline-block mb-4 ml-4 px-4 py-2 bg-${color}-500 text-white rounded hover:bg-${color}-600`}>
                <div className="flex items-center">
                    <i className={`bxr ${emoji} mr-2`}></i> {text}
                </div>
            </NavLink>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h3 className="text-2xl font-bold mb-4">Dashboard</h3>

            {getLink("/admin/book", "blue", "bxs-book", "Book List")}
            {getLink("/admin/order", "purple", "bxs-cart", "Order List")}
            {getLink("/admin/reso", "red", "bxs-refresh-cw-alt", "Return List")}
            {getLink("/admin/user", "green", "bxs-user", "User List")}
        </div>


    );
}

export default AdminHome;