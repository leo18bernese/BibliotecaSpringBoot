import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import React from "react";
import {usePageTitle} from "../../utils/usePageTitle";

const fetchUserById = async (id) => {
    const {data} = await axios.get(`/api/admin/user/${id}`);
    console.log(data);
    return data;
};

const AdminUser = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const {data: user, isLoading: isUserLoading, error: userError} = useQuery({
        queryKey: ['adminUser', id],
        queryFn: () => fetchUserById(id),
        enabled: !!id,
    });

    usePageTitle(`User #${id} - Details`);

    if (isUserLoading) {
        return <div>Loading...</div>;
    }

    if (userError) {
        return <div className="p-4">Error loading user data.</div>;
    }

    if (!user) {
        return <div className="p-4">User not found.</div>;
    }

    const {name, email, roles, addresses, cartItems, wishlistItems} = user;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-lg font-semibold">User Details</h1>
            <p className="text-sm text-gray-500">
                Viewing details for user <span className="font-mono">{name}</span>. Editing is disabled.
            </p>

            <div className="mt-8 p-4">
                <h2 className="text-md font-semibold">General Information</h2>
                <div className="pl-5 space-y-4 mt-2">
                    <p><strong>ID:</strong> {id}</p>
                    <p><strong>Name:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Roles:</strong> {roles.join(', ')}</p>
                </div>
            </div>

            <div className="mt-8 border-t-2 border-gray-600 p-4">
                <h2 className="text-md font-semibold">Addresses ({addresses.length})</h2>
                <div className="pl-5 mt-2">
                    {addresses.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                            {addresses.map(addr => (
                                <li key={addr.id}>
                                    {addr.indirizzo}, {addr.citta}, {addr.provincia}, {addr.cap}
                                </li>
                            ))}
                        </ul>
                    ) : <p>No addresses found.</p>}
                </div>
            </div>

            <div className="mt-8 border-t-2 border-gray-600 p-4">
                <h2 className="text-md font-semibold">Cart Items ({cartItems.length})</h2>
                <div className="pl-5 mt-2">
                    {cartItems.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                            {cartItems.map(item => (
                                <li key={item.bookId}>
                                    {item.bookTitle} (Book ID: {item.bookId}) - Quantity: {item.quantity}
                                </li>
                            ))}
                        </ul>
                    ) : <p>The cart is empty.</p>}
                </div>
            </div>

            <div className="mt-8 border-t-2 border-gray-600 p-4">
                <h2 className="text-md font-semibold">Wishlist Items ({wishlistItems.length})</h2>
                <div className="pl-5 mt-2">
                    {wishlistItems.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                            {wishlistItems.map(item => (
                                <li key={item.id}>
                                    {item.title} (Book ID: {item.id})
                                </li>
                            ))}
                        </ul>
                    ) : <p>The wishlist is empty.</p>}
                </div>
            </div>

            <div className="mt-8 pt-5 flex justify-end">
                <button
                    onClick={() => navigate("/admin/users")}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Back to Users List
                </button>
            </div>
        </div>
    );
}

export default AdminUser;
