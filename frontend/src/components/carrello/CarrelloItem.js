import React, {useContext} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {Link} from "react-router-dom";
import {CartContext} from "./CartContext";

const API_URL = '/api/images';

const fetchImageByBookId = async (bookId) => {
    try {
        const {data} = await axios.get(`${API_URL}/${bookId}/first`);
        return data;
    } catch (error) {

        if (error.response && error.response.status === 404) {
            console.warn(`No image found for book ID: ${bookId}`);
            return null;
        }

        console.error(`Error fetching image for book ID ${bookId}:`, error);
        toast.error('Errore durante il caricamento dell\'immagine.');
        throw error;
    }
};

const confirmNotices = async (bookId) => {
    try {
        const {data} = await axios.put(`/api/carrello/confirm-notices/${bookId}`);
        return data;
    } catch (error) {
        console.error(`Error confirming notices for book ID ${bookId}:`, error);
        toast.error('Errore durante la conferma degli avvisi di rifornimento.');
        throw error;
    }
}

const fixQuantity = async (bookId) => {
    try {
        const {data} = await axios.put(`/api/carrello/fix-quantity/${bookId}`);
        return data;
    } catch (error) {
        console.error(`Error fixing quantity for book ID ${bookId}:`, error);
        toast.error('Errore durante la sistemazione della quantità.');
        throw error;
    }
}

const CarrelloItem = ({item}) => {

    const {addItem, removeItem} = useContext(CartContext);
    const queryClient = useQueryClient();

    const {
        data: imageUrl,
        isLoading: areImageLoading,
        isError: isImageError,
        error: imageError
    } = useQuery({
        queryKey: ['bookFirst', item.libroId],
        queryFn: () => fetchImageByBookId(item.libroId),
        // Only enable if item.libroId is available
        enabled: !!item.libroId,
        staleTime: Infinity, // Images typically don't change often
    });

    const fixQuantityMutation = useMutation({
        mutationFn: fixQuantity,
        onSuccess: () => {
            toast.success('La quantità è stata corretta.');
        },
        onSettled: () => {
            return queryClient.invalidateQueries({queryKey: ['carrello']});
        }
    });

    const confirmNoticesMutation = useMutation({
        mutationFn: confirmNotices,
        onSuccess: () => {
            toast.success('Avviso confermato.');
        },
        onSettled: () => {
            return queryClient.invalidateQueries({queryKey: ['carrello']});
        }
    });


    if (areImageLoading) {
        return (
            <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
                Caricamento immagine...
            </div>
        );
    }

    if (isImageError) {
        return (
            <div className="bg-white shadow-md rounded-lg p-4 flex items-center text-red-600">
                Errore caricamento immagine: {imageError.message}
            </div>
        );
    }

    const imageSource = imageUrl ? `${API_URL}/${item.libroId}/first` : `${API_URL}/nf.jpg`;
    const rifornimento = item.rifornimento;
    console.log("data libro", item);

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <div key={item.libroId} className=" flex items-center">
                <img
                    src={imageSource}
                    alt={item.titolo}
                    className="w-32 h-40 object-cover rounded-md mr-4"/>

                <div className="flex-1 flex justify-between items-start">
                    <div>
                        <Link to={`/book/${item.libroId}`} className="text-xl font-semibold hover:underline">
                            {item.titolo}
                        </Link>

                        <p className="text-gray-700">di {item.autore.nome}</p>
                        <p className="text-gray-700 mb-4">Edizione anno {item.annoPubblicazione}</p>
                        <p className="text-gray-500 text-sm"> Aggiunto al carrello
                            il: {new Date(item.dataAggiunta).toLocaleString()}</p>

                        <div className="border-2 text-gray-600 border-gray-600 rounded-md inline-flex p-1">
                            <button className="sm:mx-2 md:mx-1 lg:mx-1 hover:bg-gray-100 transition-all rounded-md" onClick={() => removeItem(item.libroId, 1)}>-
                            </button>

                            <div className="sm:mx-4 md:mx-2 lg:mx-2">{item.quantita}</div>

                            <button className="sm:mx-2 md:mx-1 lg:mx-1 hover:bg-gray-100 transition-all rounded-md" onClick={() => addItem(item.libroId, 1)}>+
                            </button>
                        </div>
                    </div>

                    <div className="text-right font-semibold ml-4">
                        <p className="text-gray-500  text-lg ">{item.prezzo} €</p>
                        <span className="text-gray-400 ">ID: {item.libroId}</span>
                    </div>
                </div>


            </div>

            {item.quantita > rifornimento.disponibili && (
                <div className="mt">
                    <p className="text-red-600 bg-red-200 font-semibold mt-2 p-4 rounded-xl">
                        <b>Attenzione</b>: La quantità ordinata supera le copie disponibili
                        ({rifornimento.disponibili} in
                        magazzino).

                        <br/>

                        <button
                            className="font-bold underline hover:text-red-800"
                            onClick={() => fixQuantityMutation.mutate(item.libroId)}
                            disabled={fixQuantityMutation.isPending}
                        >
                            {fixQuantityMutation.isPending ? 'Sistemando...' : 'Clicca qui'}
                        </button>
                        {' '}per ridurre la quantità o aspetta il rifornimento.

                        <br/>

                        {rifornimento.prossimoRifornimento && (
                            <span> Prossimo rifornimento previsto per il {new Date(rifornimento.prossimoRifornimento).toLocaleDateString()}.</span>
                        )}
                    </p>
                </div>
            )}

            {item.prezzoAggiunta > 0 && (
                <>
                    {item.prezzoAggiunta > item.prezzo && (
                        <div className="mt-2">
                            <p className="text-green-600 bg-green-200 font-semibold p-4 rounded-xl">
                                Il prezzo di questo articolo è diminuito
                                di {((item.prezzoAggiunta - item.prezzo)).toFixed(2)} €
                                per unità rispetto a quando è stato aggiunto al carrello.

                                <br/>
                                <br/>

                                <span className=" text-gray-500">Prezzo:
                                    <span className="line-through">{item.prezzoAggiunta}</span> € → <span className="font-bold">{item.prezzo} €</span>
                                </span>

                                <br/>
                                <br/>

                                <button
                                    className="font-bold underline hover:text-green-800"
                                    onClick={() => confirmNoticesMutation.mutate(item.libroId)}
                                    disabled={confirmNoticesMutation.isPending}
                                >
                                    {confirmNoticesMutation.isPending ? 'Confermando...' : 'Clicca per rimuovere l\'avviso'}
                                </button>
                            </p>
                        </div>
                    )}

                    {item.prezzoAggiunta < item.prezzo && (
                        <div className="mt-2">
                            <p className="text-orange-600 bg-orange-200 font-semibold p-4 rounded-xl">
                                Il prezzo di questo articolo è aumentato
                                di {((item.prezzo - item.prezzoAggiunta)).toFixed(2)} €
                                per unità rispetto a quando è stato aggiunto al carrello.

                                <br/>
                                <br/>

                                <span className=" text-gray-500">Prezzo:
                                    <span className="line-through">{item.prezzoAggiunta}</span> € → <span className="font-bold">{item.prezzo} €</span>
                                </span>

                                <br/>
                                <br/>

                                <button
                                    className="font-bold underline hover:text-orange-800"
                                    onClick={() => confirmNoticesMutation.mutate(item.libroId)}
                                    disabled={confirmNoticesMutation.isPending}
                                >
                                    {confirmNoticesMutation.isPending ? 'Confermando...' : 'Clicca per rimuovere l\'avviso'}
                                </button>
                            </p>
                        </div>
                    )}
                </>
            )}


        </div>
    );
};

export default CarrelloItem;