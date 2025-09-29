import React, {useContext} from 'react';
import {UserContext} from "../UserContext";
import {useNavigate} from "react-router-dom";
import {usePageTitle} from "../../utils/usePageTitle"; // Recommended for prop type validation

const Shipping = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    usePageTitle('Shipping Addresses');

    const indirizzi = user.indirizzi || [];

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Order History</h2>

            {indirizzi.length === 0 ? (
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indirizzo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CAP</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Città</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefono</th>
                        </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                        {indirizzi.map((indirizzo) => (
                            <tr key={indirizzo.id}
                                className="cursor-pointer hover:bg-gray-100">

                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.nome}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.indirizzo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.cap}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.citta}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.provincia}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{indirizzo.telefono}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
};

export default Shipping;