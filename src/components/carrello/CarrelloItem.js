import React, {useContext} from 'react';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {Link} from "react-router-dom";
import {CartContext} from "./CartContext";

const API_URL = 'http://localhost:8080/api/images';

const fetchImageByBookId = async (bookId) => {
    try {
        const {data} = await axios.get(`${API_URL}/${bookId}/first`);
        return data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(`No image found for book ID: ${bookId}`);
            // You might want to handle this more gracefully, e.g., return a placeholder
            return null; // Return null or a placeholder if no image
        }
        console.error(`Error fetching image for book ID ${bookId}:`, error);
        toast.error('Errore durante il caricamento dell\'immagine.');
        throw error; // Re-throw other errors
    }
};

const CarrelloItem = ({item}) => {

    const {addItem, removeItem} = useContext(CartContext);

    const {
        data: imageUrl,
        isLoading: areImageLoading,
        isError: isImageError,
        error: imageError
    } = useQuery({
        queryKey: ['image', item.libroId],
        queryFn: () => fetchImageByBookId(item.libroId),
        // Only enable if item.libroId is available
        enabled: !!item.libroId,
        staleTime: Infinity, // Images typically don't change often
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

    const imageSource = imageUrl ? `${API_URL}/${item.libroId}/first` : 'placeholder-image-url.jpg'; // Provide a placeholder

    return (
        <div key={item.libroId} className="bg-white shadow-md rounded-lg p-4 flex items-center">
            <img
                src={imageSource}
                alt={item.titolo}
                className="w-24 h-32 object-cover rounded-md mr-4"/>

            <div className="flex-1 flex justify-between items-start">
                <div>
                    <Link to={`/libri/${item.libroId}`} className="text-xl font-semibold hover:underline">
                        {item.titolo}
                    </Link>

                    <p className="text-gray-700">di {item.autore}</p>
                    <p className="text-gray-700 mb-4">Scritto nel: {item.annoPubblicazione}</p>

                    <div className="border-2 border-gray-600 rounded-md inline-flex p-1 space-x-2">
                        <button className="text-gray-600" onClick={() => removeItem(item.libroId, 1)}>-</button>

                        <p className="text-gray-600">{item.quantita}</p>

                        <button className="text-gray-600" onClick={() => addItem(item.libroId, 1)}>+</button>
                    </div>
                </div>

                <div className="text-right font-semibold text-lg ml-4">
                    <p className="text-gray-500">{item.prezzo} €</p>
                </div>
            </div>
        </div>
    );
};

export default CarrelloItem;