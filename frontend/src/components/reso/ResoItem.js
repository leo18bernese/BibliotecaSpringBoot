import React from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";

const fetchBookImage = async (id) => {
    try {
        const {data} = await axios.get(`/api/images/${id}/first`);
        return data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(`No image found for book ID: ${id}`);
            return null;
        }
        console.error(`Error fetching image for book ID ${id}:`, error);
        throw error;
    }
}

const ResoItem = ({item}) => {

    const ordineItem = item.ordineItem;
    const bookId = ordineItem?.id;

    const {data: bookImage, isLoading: isImageLoading, error: imageError} = useQuery({
        queryKey: ['bookFirst', bookId],
        queryFn: () => fetchBookImage(bookId),
        enabled: !!bookId, // Only fetch if bookId is available
    });


    return (
        <div key={item.id} className="bg-white border border-gray-300 rounded-xl p-4 flex items-center my-3">

            <img
                src={`/api/images/${bookId}/first`}
                alt={item.titolo}
                className="w-24 h-32 object-cover rounded-md mr-4"/>

            <div className="flex-1 flex justify-between items-start">
                <div>
                    <Link to={`/book/${ordineItem.id}`} className="text-xl font-semibold hover:underline">
                        {ordineItem.titolo}
                    </Link>

                    <p className="text-gray-700">Quantità di reso: {item.quantita} di {ordineItem.quantita}</p>
                </div>

                <div className="text-right font-semibold text-lg ml-4">
                    <p className="text-gray-500">€ {ordineItem.prezzo} {item.quantita > 1 && "cad."}</p>
                </div>
            </div>
        </div>
    );
}

export default ResoItem;