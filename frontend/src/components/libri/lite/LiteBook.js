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

const LiteBook = ({bookID, book: providedBook}) => {

    const bookId = bookID || providedBook?.libroId;

    const {data: parsedBook, isLoading: isBookLoading, error: bookError} = useQuery({
        queryKey: ['liteBook', bookId],
        queryFn: () => fetchBookById(bookId),
        enabled: !providedBook && !!bookId,
    });

    const {data: bookImage, isLoading: isImageLoading, error: imageError} = useQuery({
        queryKey: ['bookFirst', bookId],
        queryFn: () => fetchBookImage(bookId),
        enabled: !!bookId,
    });

    const book = providedBook || parsedBook;

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
                        <div
                            className={`w-full rounded-md mb-5 h-64 ${isImageLoading ? 'bg-gray-200 animate-pulse' : imageError ? 'bg-red-200' : bookImage ? '' : 'bg-gray-200 flex items-center justify-center'}`}
                            style={{ height: '250px' }}
                        >
                            {isImageLoading ? (
                                <span className="text-gray-500">Loading image...</span>
                            ) : imageError ? (
                                <span className="text-red-500">Error loading image</span>
                            ) : bookImage ? (
                                <img
                                    src={`/api/images/${bookId}/first`}
                                    alt={`Cover of ${book.titolo}`}
                                    className="w-full h-full object-cover rounded-md"
                                />
                            ) : (
                                <span className="text-gray-500">No image available</span>
                            )}
                        </div>

                    </Link>


                    <h3>{book.titolo}</h3>
                    <p>by {book.autore.nome}</p>

                    <h3 className="text-gray-600 text-lg">
                        {book.prezzo ? `€${book.prezzo.toFixed(2)}` : 'Price not available'}
                    </h3>
                </div>
            </div>
        </>
    );
}

export default LiteBook;