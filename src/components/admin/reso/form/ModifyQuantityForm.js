import React, {useState} from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {useQueryClient} from '@tanstack/react-query';

const ModifyQuantityForm = ({resoId, itemId, resoItem}) => {
    const [quantity, setQuantity] = useState('');
    const queryClient = useQueryClient();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!quantity) {
            toast.error('Imposta una quantità valida.');
            return;
        }

        const code = parseInt(quantity, 10);

        try {

            const params = new URLSearchParams();
            params.append('quantity', code);

            await axios.patch(`/api/admin/resi/${resoId}/quantity/${itemId}`, params);

            toast.success('Quantità aggiornata con successo.');
            setQuantity('');

            await queryClient.invalidateQueries(['reso', resoId]);
        } catch (error) {
            toast.error('Errore durante l\'aggiornamento della quantità.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex justify-between">
                <div>
                    <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className=" block w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        placeholder="Nuova quantità"
                        min="1"
                        max={resoItem.ordineItem.quantita}
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 ml-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Aggiorna
                </button>
            </form>
        </div>
    );
};

export default ModifyQuantityForm;

