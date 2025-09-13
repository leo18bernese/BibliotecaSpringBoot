import {Link} from "react-router-dom";
import {usePageTitle} from "../../utils/usePageTitle";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";

const fetchUsers = async () => {
    const {data} = await axios.get('/api/admin/user/light-all');
    return data;
}

const AdminUserHome = () => {
    const {data: users, isLoading, error} = useQuery({
        queryKey: ['adminUsers'],
        queryFn: fetchUsers,
        select: (data) => data.sort((a, b) => a.id - b.id), // Ordina i libri per ID in ordine crescente
    });

    usePageTitle('Admin Home');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading users.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - User List</h1>
            <table className="min-w-full bg-white border text-left border-gray-200">

                <thead>
                <tr>
                    <th className="py-2 px-4 border-b border-gray-200">ID</th>
                    <th className="py-2 px-4 border-b border-gray-200">Name</th>
                    <th className="py-2 px-4 border-b border-gray-200">Email</th>
                    <th className="py-2 px-4 border-b border-gray-200">Roles</th>
                    <th className="py-2 px-4 border-b border-gray-200">Cart Items</th>
                    <th className="py-2 px-4 border-b border-gray-200">Wishlist Items</th>
                    <th className="py-2 px-4 border-b border-gray-200">Address Count</th>
                    <th className="py-2 px-4 border-b border-gray-200">Actions</th>
                </tr>
                </thead>

                <tbody>
                {users.map((user) => (
                    console.log(user),
                        <tr key={user.id} className="hover:bg-gray-100">
                            <td className="py-2 px-4 border-b border-gray-200">{user.id}</td>
                            <td className="py-2 px-4 border-b border-gray-200">{user.name}</td>
                            <td className="py-2 px-4 border-b border-gray-200">{user.email}</td>
                            <td className="py-2 px-4 border-b border-gray-200">{user.roles.length > 0 ? user.roles.join(', ') : '/'}</td>
                            <td className="py-2 px-4 border-b border-gray-200">{user.cartItems}</td>
                            <td className="py-2 px-4 border-b border-gray-200">{user.wishlistItems}</td>
                            <td className="py-2 px-4 border-b border-gray-200">{user.addresses}</td>

                            <td className="py-2 px-4 border-b border-gray-200">
                                <Link
                                    to={`/admin/user/${user.id}`}
                                    className="text-blue-500 hover:underline"
                                >
                                    Manage User
                                </Link>
                            </td>
                        </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUserHome;