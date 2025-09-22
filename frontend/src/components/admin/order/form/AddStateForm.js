import React, {useState} from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {useQueryClient} from '@tanstack/react-query';

const OrderAddStateForm = ({orderId, stati}) => {
    const [selectedStato, setSelectedStato] = useState('');
    const queryClient = useQueryClient();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStato) {
            toast.error('Seleziona uno stato.');
            return;
        }

        try {
            await axios.patch(`/api/admin/order/${orderId}/stato`, {
                stato: selectedStato,
            });

            toast.success('Stato aggiunto con successo.');
            setSelectedStato('');

            await queryClient.invalidateQueries(['reso', orderId]);
        } catch (error) {
            toast.error(error.response?.data || 'Errore durante l\'aggiunta dello stato.');
        }
    };

    return (
        <div className="mt-8 ">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="stato" className="block text-sm font-medium text-gray-700">
                        Nuovo Stato
                    </label>

                    <select
                        id="stato"
                        value={selectedStato}
                        onChange={(e) => setSelectedStato(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-200"
                    >

                        <option value="" disabled>Seleziona uno stato</option>

                        {stati.map((stato) => (
                            <option key={stato} value={stato}>
                                {stato}
                            </option>
                        ))}

                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >

                    <div className="flex items-center mx-auto justify-center">
                        <i className="bx bx-plus-circle mr-2 text-xl "></i>
                        <span>Aggiungi Stato</span>
                    </div>

                </button>
            </form>
        </div>
    );
};

export default OrderAddStateForm;

