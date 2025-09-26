import React, {useContext, useState} from 'react';
import {UserContext} from "../UserContext";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";

const fetchAccesses = async (page = 0, size = 10) => {
    const {data} = await axios.get(`/api/auth/account-accesses`, {
        params: {page, size}
    });
    return data;
}

const Security = () => {
    const {user} = useContext(UserContext);
    const [page, setPage] = useState(0);

    const {data: pagedData, isLoading: isAccessesLoading, error: accessesError} = useQuery({
        queryKey: ['accesses', user.id, page],
        queryFn: () => fetchAccesses(page),
        keepPreviousData: true, // Utile per non mostrare uno stato di caricamento durante il cambio pagina
    });

    if (isAccessesLoading) {
        return <div className="text-center text-gray-500">Loading accesses...</div>;
    }

    if (accessesError) {
        console.error("Error fetching accesses:", accessesError);
        return <div className="text-center text-red-500">Error loading accesses. Please try again later.</div>;
    }

    const accesses = pagedData?.content || [];

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Security & Access Logs</h2>

            {accesses.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p>No access records found.</p>
                </div>
            ) : (
                <div>
                    <p>Below is a list of your recent access logs. If you notice any unfamiliar activity, please
                        contact support immediately.</p>
                    <p>You are able to take action for certain activities, such as logging out from other devices.</p>

                    <table className="min-w-full divide-y divide-gray-200 mt-8">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ip
                                address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login
                                time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout
                                time
                            </th>
                        </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                        {accesses.map((indirizzo) => (
                            <tr key={indirizzo.id}
                                className="cursor-pointer hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.ipAddress}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{new Date(indirizzo.loginTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.logoutTime ? new Date(indirizzo.logoutTime).toLocaleString() : 'N/A'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => setPage(old => Math.max(old - 1, 0))}
                            disabled={pagedData?.first}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            Previous
                        </button>
                        <span>
                            Page {pagedData ? pagedData.number + 1 : 0} of {pagedData?.totalPages}
                        </span>
                        <button
                            onClick={() => setPage(old => (pagedData && !pagedData.last ? old + 1 : old))}
                            disabled={pagedData?.last}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Security;
