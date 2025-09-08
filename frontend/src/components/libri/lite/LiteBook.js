import React, {useContext} from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {useWishlist} from "../wishlist/WishlistContext";
import {UserContext} from "../../user/UserContext";

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

    const user = useContext(UserContext);
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

    const {hasWishlisted, isLoadingWishlist, addToWishlist, removeFromWishlist} =
        useWishlist(bookId);

    const book = providedBook || parsedBook;

    if (isBookLoading || isLoadingWishlist) {
        return <div>Loading...</div>;
    }

    if (bookError) {
        return <div>Error loading book details.</div>;
    }

    if (!book || book.hidden) {
        return <div>Book not found.</div>;
    }

    const sconto = book.sconto;
    const hasSconto = sconto.percentuale > 0 || sconto.valore > 0;
    console.log(book);

    return (
        <>
            <div className="bg-white shadow-md rounded-lg  mb-4">
                <div className="book-card">

                    <Link to={`/book/${bookId}`}>
                        <div className="relative">
                            <div
                                className={`w-full rounded-md mb-5 h-64 ${isImageLoading ? 'bg-gray-200 animate-pulse' : imageError ? 'bg-red-200' : bookImage ? '' : 'bg-gray-200 flex items-center justify-center'}`}
                                style={{height: '250px'}}
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

                            {hasSconto && (
                                <div
                                    className="absolute top-2 left-2 bg-red-500 text-white px-4 py-2 rounded-md font-semibold">
                                    -{sconto.percentuale > 0 ? `${sconto.percentuale}%` : `${sconto.valore}€`}
                                </div>
                            )}

                            {user && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        hasWishlisted ? removeFromWishlist(bookId) : addToWishlist(bookId);
                                    }}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md shadow-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    <i className={`${hasWishlisted ? 'bxs-heart text-red-500' : 'bx-heart text-gray-400'} bx text-lg`}></i>
                                </button>
                            )}
                        </div>

                    </Link>


                    <div className="p-4">
                        <h3>{book.titolo}</h3>
                        <p>by {book.autore}</p>

                        <div className="mt-8 mb-4">Producted by {book.editore}</div>

                        <h3 className="text-lg font-semibold">
                            {hasSconto && (
                                <span className="line-through mr-2 text-gray-400 text-base font-normal">
                                  €{book.prezzoOriginale.toFixed(2)}
                                </span>
                            )}
                            <span className="text-green-600 text-xl font-bold">
                                {book.prezzo ? `€${book.prezzo.toFixed(2)}` : 'Price not available'}
                              </span>
                        </h3>

                    </div>

                </div>
            </div>
        </>
    );
}

export default LiteBook;