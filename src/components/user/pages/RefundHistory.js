import React, {useContext} from 'react';
import {UserContext} from "../UserContext";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom"; // Recommended for prop type validation


const fetchReturns = async () => {
    const {data} = await axios.get("/api/resi/all");
    console.log("Fetched returns:", data);
    return data;
}

const ReturnsHistory = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    const {data: returns, isLoading, error} = useQuery({
        queryKey: ['returns'],
        queryFn: fetchReturns,
        enabled: !!user // Only fetch returns if user is available
    });

    if (isLoading) {
        return <div className="text-center text-gray-500">Loading returns...</div>;
    }

    if (error) {
        console.error("Error fetching returns:", error);
        return <div className="text-center text-red-500">Error loading returns. Please try again later.</div>;
    }

    console.log("Returns:", returns);
    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Returns History</h2>

            {returns.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p>No returns found.</p>
                </div>
            ) : (
                <div>
                    <p>Questi sono i resi che hai richiesto. </p>
                    <p>Clicca su un reso per vederne i dettagli, inclusi gli articoli restituiti e l'ordine di riferimento.</p>

                    <table className="min-w-full divide-y divide-gray-200 mt-8">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return
                                #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {returns.map((refund) => (
                            <tr key={refund.id} onClick={() => navigate(`/reso/${refund.id}`)}
                                className="cursor-pointer hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">#{refund.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">{new Date(refund.dataCreazione).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap  text-gray-900">
                                    <div className="bg-gray-300 p-2 rounded-md text-center ">{refund.statoName}</div>
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

export default ReturnsHistory;