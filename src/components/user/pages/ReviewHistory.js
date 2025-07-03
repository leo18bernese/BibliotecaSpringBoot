import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {UserContext} from "../UserContext";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom"; // Recommended for prop type validation


const fetchReviews = async () => {
    const {data} = await axios.get("/api/recensioni/all/user");
    return data;
}

const ReviewHistory = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    const {data: reviews, isLoading, error} = useQuery({
        queryKey: ['reviews'],
        queryFn: fetchReviews,
        enabled: !!user // Only fetch reviews if user is available
    });

    if (isLoading) {
        return <div className="text-center text-gray-500">Loading reviews...</div>;
    }

    if (error) {
        console.error("Error fetching reviews:", error);
        return <div className="text-center text-red-500">Error loading reviews. Please try again later.</div>;
    }

    console.log("Fetched reviews:", reviews);

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Rewiew History</h2>

            {reviews.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p>No reviews found.</p>
                    <p>Start reviewing books to see them here!</p>
                </div>
            ) : (
                <div>
                    <p>Queste sono le recensioni che hai scritto.</p>
                    <p>Clicca su una recensione per visualizzarne i dettagli.</p>

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
                        {reviews.map((order) => (
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

export default ReviewHistory;