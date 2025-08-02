import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {UserContext} from "../UserContext";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom"; // Recommended for prop type validation


const fetchOrders = async () => {
    const {data} = await axios.get("/api/ordini/all");
    return data;
}

const OrderHistory = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    const {data: orders, isLoading, error} = useQuery({
        queryKey: ['orders'],
        queryFn: fetchOrders,
        enabled: !!user // Only fetch orders if user is available
    });

    if (isLoading) {
        return <div className="text-center text-gray-500">Loading orders...</div>;
    }

    if (error) {
        console.error("Error fetching orders:", error);
        return <div className="text-center text-red-500">Error loading orders. Please try again later.</div>;
    }

    console.log("Orders:", orders);
    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Order History</h2>

            {orders.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p>No orders found.</p>
                    <p>Start shopping to see your orders here!</p>
                </div>
            ) : (
                <div>
                    <p>Questi sono gli ordini che hai effettuato.</p>
                    <p>Clicca su un ordine per visualizzarne i dettagli.</p>

                    <table className="min-w-full divide-y divide-gray-200 mt-8">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order
                                #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id} onClick={() => navigate(`/ordine/${order.id}`)}
                                className="cursor-pointer hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">#{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">{new Date(order.dataCreazione).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">€ {order.prezzoFinale}</td>
                                <td className="px-6 py-4 whitespace-nowrap  text-gray-900">
                                    <div className="bg-gray-300 p-2 rounded-md text-center ">{order.statoName}</div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
};

export default OrderHistory;