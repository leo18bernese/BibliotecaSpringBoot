import {useNavigate} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import React from "react";
import axios from "axios";

const fetchBookImage = async (id) => {
    console.log(`Fetching image for book ID: ${id}`);
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

const WishlistItem = ({ book }) => {
    const navigate = useNavigate();
    const bookId = book.id;

    const { data: bookImage, isLoading: isImageLoading } = useQuery({
        queryKey: ['bookFirst', book.id],
        queryFn: () => fetchBookImage(book.id),
        enabled: !!book.id,
    });

    return (
        <tr
            key={book.id}
            onClick={() => navigate(`/book/${book.id}`)}
            className="cursor-pointer hover:bg-gray-100"
        >
            <td className="px-6 py-4 whitespace-nowrap">
                {bookImage ? (
                    <img
                        src={`/api/images/${bookId}/first`}
                        alt={`Cover of ${book.titolo}`}
                        className="w-full h-64 object-cover rounded-md mb-5"
                        style={{maxHeight: "200px"}}
                    />
                ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md mb-5"
                         style={{maxHeight: "200px"}}>
                        <span className="text-gray-500">No image available</span>
                    </div>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">{book.titolo}</td>
        </tr>
    );
};


export default WishlistItem;