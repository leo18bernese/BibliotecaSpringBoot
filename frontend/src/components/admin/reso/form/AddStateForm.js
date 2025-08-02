import React, {useState} from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {useQueryClient} from '@tanstack/react-query';

const AddStateForm = ({resoId, stati}) => {
    const [selectedStato, setSelectedStato] = useState('');
    const [messaggio, setMessaggio] = useState('');
    const queryClient = useQueryClient();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStato) {
            toast.error('Seleziona uno stato.');
            return;
        }

        try {
            await axios.patch(`/api/admin/resi/${resoId}/stato`, {
                stato: selectedStato,
                messaggio: messaggio,
            });

            toast.success('Stato aggiunto con successo.');
            setSelectedStato('');
            setMessaggio('');

            await queryClient.invalidateQueries(['reso', resoId]);
        } catch (error) {
            toast.error('Errore durante l\'aggiunta dello stato.');
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

                <div>
                    <label htmlFor="messaggio" className="block text-sm font-medium text-gray-700">
                        Messaggio (opzionale)
                    </label>

                    <textarea
                        id="messaggio"
                        value={messaggio}
                        onChange={(e) => setMessaggio(e.target.value)}
                        rows="3"
                        className="py-3 px-2 mt-1 block w-full m:text-sm  border-2 border-gray-300 rounded-md"
                    ></textarea>
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

export default AddStateForm;

