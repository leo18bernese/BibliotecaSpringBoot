import React, {useContext} from 'react';
import {UserContext} from "../UserContext";
import {useNavigate} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import axios from "axios"; // Recommended for prop type validation

const fetchAccesses = async () => {
    const {data} = await axios.get(`/api/auth/account-accesses`);

    return data;
}

const Security = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    const {data: accesses, isLoading: isAccessesLoading, error: accessesError} = useQuery({
        queryKey: ['accesses', user.id],
        queryFn: () => fetchAccesses(user.id),
    });

    if (isAccessesLoading) {
        return <div className="text-center text-gray-500">Loading accesses...</div>;
    }

    if (accessesError) {
        console.error("Error fetching accesses:", accessesError);
        return <div className="text-center text-red-500">Error loading accesses. Please try again later.</div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Order History</h2>

            {accesses.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p>You have not saved any addresses yet.</p>
                </div>
            ) : (
                <div>
                    <p>These are the addresses you have saved.</p>
                    <p>You will be able to use them during checkout.</p>

                    <table className="min-w-full divide-y divide-gray-200 mt-8">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ip address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Agent</th>
                        </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                        {accesses.map((indirizzo) => (
                            <tr key={indirizzo.id}
                                className="cursor-pointer hover:bg-gray-100">

                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.ipAddress}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{new Date(indirizzo.loginTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.logoutTime ? new Date(indirizzo.logoutTime).toLocaleString() : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.userAgent}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
};

export default Security;