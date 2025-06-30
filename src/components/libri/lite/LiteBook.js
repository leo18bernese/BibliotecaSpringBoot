import React from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";

const fetchBookById = async (id) => {
    const {data} = await axios.get(`/api/libri/lite/${id}`);
    return data;
}

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

const LiteBook = ({bookId}) => {

    const {data: book, isLoading: isBookLoading, error: bookError} = useQuery({
        queryKey: ['liteBook', bookId],
        queryFn: () => fetchBookById(bookId),
    });

    const {data: bookImage, isLoading: isImageLoading, error: imageError} = useQuery({
        queryKey: ['bookFirst', bookId],
        queryFn: () => fetchBookImage(bookId),
        enabled: !!bookId, // Only fetch if bookId is available
    });

    if (isBookLoading) {
        return <div>Loading...</div>;
    }

    if (bookError) {
        return <div>Error loading book details.</div>;
    }

    return (
        <>
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                <div className="book-card">

                    <Link to={`/book/${bookId}`}>
                        {bookImage ? (
                            <img
                                src={`/api/images/${bookId}/first`}
                                alt={`Cover of ${book.titolo}`}
                                className="w-full h-64 object-cover rounded-md mb-5"
                                style={{height: '250px'}}
                            />
                        ) : (
                            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md mb-5"
                                 style={{height: '250px'}}>
                                <span className="text-gray-500">No image available</span>
                            </div>
                        )}
                    </Link>


                    <h3>{book.titolo}</h3>
                    <p>by {book.autore}</p>
                </div>
            </div>
        </>
    );
}

export default LiteBook;