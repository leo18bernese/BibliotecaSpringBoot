// src/components/SearchBooks.js
import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import ImageGallery from "../images/ImageGallery";
import {CartContext} from "../../carrello/CartContext";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import toast, {Toaster} from "react-hot-toast";
import BookInfoTabs from "./BookInfoTabs";
import NuovaRecensione from "../../recensioni/NuovaRecensione";
import {UserContext} from "../../user/UserContext";
import {useAuth} from "../../user/AuthContext";

const API_URL = '/api/images';

const fetchBookById = async (id) => {
    const {data} = await axios.get(`/api/libri/${id}`);
    console.log("fetched book data:", data);
    return data;
};

const fetchBookExists = async (id) => {
    if (!id || id <= 0) return false;
    const {data} = await axios.get(`/api/libri/exists/${id}`);
    return data;
}

const fetchImageIds = async (id) => {
    try {
        const {data} = await axios.get(`/api/images/${id}`);
        return data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn("No images found for this book:", error);
            return -1;
        }

        throw error; // Rethrow other errors
    }
}

const fetchReviews = async (id) => {
    const {data} = await axios.get(`/api/recensioni/all/${id}`);

    return data;
};

const fetchCartItem = async (bookId) => {
    try {
        const {data} = await axios.get(`/api/carrello/items/${bookId}`);
        return data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
}

const fetchHasWishlisted = async (id) => {
    const {data} = await axios.get(`/api/wishlist/has/${id}`);

    console.log("Has wishlisted:", data);

    return data;
}


const BookInfo = () => {
    const {user} = useContext(UserContext);
    const {showLoginPrompt} = useAuth();

    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {addItem} = useContext(CartContext);

    const bookId = Number.parseInt(id);
    const previousId = bookId - 1;
    const nextId = bookId + 1;

    const [file, setFile] = useState(null);

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const focusReview = params.get("focusReview");


    const {data: book, isLoading: isBookLoading, error: bookError} = useQuery({
        queryKey: ['book', bookId],
        queryFn: () => fetchBookById(bookId),
    });


    const {data: previousBookExists} = useQuery({
        queryKey: ['bookExists', previousId],
        queryFn: () => fetchBookExists(previousId),
        enabled: previousId > 0
    });

    const {data: nextBookExists} = useQuery({
        queryKey: ['bookExists', nextId],
        queryFn: () => fetchBookExists(nextId),
    });

    const {data: images, isLoading: areImagesLoading} = useQuery({
        queryKey: ['images', bookId],
        queryFn: () => fetchImageIds(bookId),
    });

    const {data: reviews = [], isLoading: areReviewsLoading} = useQuery({
        queryKey: ['reviews', bookId],
        queryFn: () => fetchReviews(bookId),
    });

    const {data: cartItem} = useQuery({
        queryKey: ['cartItem', bookId],
        queryFn: () => fetchCartItem(bookId),
        enabled: !!user
    });

    const {data: hasWishlisted} = useQuery({
        queryKey: ['hasWishlisted', bookId],
        queryFn: () => fetchHasWishlisted(bookId),
        enabled: !!user
    });


    const handlePreviousBook = () => {
        if (previousBookExists) {
            navigate(`/book/${previousId}`);
        }
    }

    const handleNextBook = () => {
        if (nextBookExists) {
            navigate(`/book/${nextId}`);
        }
    }

    const handleUpload = () => {
        if (!file) {
            console.error('No file selected for upload');
            toast.error('Please upload a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        axios.post(`/api/images/${id}`, formData)
            .then(response => {
                console.log('File uploaded successfully:', response.data);
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
    }


    const addToWishlist = async (bookId) => {
        if (!user) {
            showLoginPrompt();
            return;
        }
        try {
            const {data} = await axios.post(`/api/wishlist/${bookId}`);
            await queryClient.invalidateQueries(['hasWishlisted', bookId]);

            return data;
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            throw error;
        }
    }

    const removeFromWishlist = async (bookId) => {
        if (!user) {
            showLoginPrompt();
            return;
        }
        try {
            const {data} = await axios.delete(`/api/wishlist/${bookId}`);
            await queryClient.invalidateQueries(['hasWishlisted', bookId]);

            return data;
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            throw error;
        }
    }

    const isLoading = isBookLoading || areImagesLoading || areReviewsLoading;

    useEffect(() => {
        if (!isLoading && !areReviewsLoading && focusReview) {
            const element = document.getElementById(`review-${focusReview}`);
            if (element) {
                element.classList.add("highlight");
                element.scrollIntoView({behavior: "smooth"});
                element.focus();

                setTimeout(() => {
                    element.classList.remove("highlight");
                }, 2000);
            }
        }
    }, [areReviewsLoading, focusReview, isLoading]);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Caricamento...</div>;
    }

    if (bookError) {
        return <div className="flex justify-center items-center min-h-screen">Errore: {bookError.message}</div>;
    }

    if (!book) {
        return <div className="p-4 ">
            Non siamo riusciti a trovare il libro che stavi cercando.
            Possibili cause:

            <ul className="my-5 " style={{listStyleType: 'disc', paddingLeft: '20px'}}>
                <li>Il libro non esiste o è stato rimosso.</li>
                <li>Il libro è stato spostato o il suo ID è errato.</li>
                <li>Il libro non è ancora stato pubblicato.</li>
            </ul>

            La preghiamo di assicurarsi che l'ID del libro sia corretto e che il libro sia disponibile nel nostro
            catalogo.<br/>
            Se il problema persiste, contatti il supporto clienti.
        </div>;
    }


    console.log("Book data:", book);

    const rifornimento = book.rifornimento;
    const isDisponibile = rifornimento.quantita > 0;

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <Toaster/>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                        <ImageGallery id={id} images={images} API_URL={API_URL}/>
                    </div>

                    <div className="md:w-1/2 grid grid-cols-2 gap-8" style={{alignItems: 'start'}}>
                        <div className="p-4 bg-white shadow-md rounded-lg">
                            <h1 className="text-2xl font-bold mb-4">{book.titolo}</h1>

                            <div className="text-gray-700 mb-6">
                                <p className="mb-2"><strong>Autore:</strong> {book.autore}</p>
                                <p className="mb-2"><strong>Genere:</strong> {book.genere}</p>
                                <p className="mb-4"><strong>Anno di pubblicazione:</strong> {book.annoPubblicazione}</p>
                            </div>

                        </div>


                        <div className="bg-white shadow-md rounded-lg p-4 ">
                            <h3 className="text-xl font-semibold mb-4">Acquisto</h3>

                            <div className="flex items-center space-x-3">
                                {rifornimento.prezzoTotale < rifornimento.prezzo &&
                                    <p className="text-red-600 text-2xl line-through font-bold mb-2"
                                       style={{textDecorationThickness: '3px'}}> {rifornimento.prezzo.toFixed(2)} €</p>
                                }
                                <p className="text-2xl font-semibold mb-2"> {rifornimento.prezzoTotale.toFixed(2)} €</p>
                            </div>

                            <span className="p-2 rounded-2xl font-semibold uppercase text-sm mb"
                                  style={{backgroundColor: '#d1fae5', color: '#065f46'}}>
                                <span className="">-{rifornimento.sconto.percentuale}% sconto</span>
                            </span>


                            <p className="mt-6 "><b className="font-bold"
                                                    style={{color: rifornimento.color}}>{rifornimento.status}</b></p>

                            <p className="mt-1 mb-4">
                                <b className="text-red-500 font-bold">
                                    {hasWishlisted ?
                                        <>
                                            <button onClick={() => removeFromWishlist(bookId)}>
                                                <i className="bxr bxs-heart mr-1.5"></i></button>
                                            Questo libro è nella tua wishlist!
                                        </> :
                                        <>
                                            <button onClick={() => addToWishlist(bookId)}>
                                                <i className="bxr bx-heart mr-1.5"></i>
                                            </button>
                                            Aggiungi alla wishlist
                                        </>}
                                </b>
                            </p>

                            {cartItem && cartItem.quantita > 0 ?
                                <p className="mt-1 mb-4"><b className="text-blue-500 font-bold">Hai
                                    già {cartItem.quantita} unità nel carrello</b></p>
                                : <p className="mb-4"></p>}

                            <div className="flex flex-col gap-2">
                                <button
                                    className={` ${!isDisponibile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold py-2 px-4 rounded-xl transition`}
                                    onClick={() => user ? addItem(book.id, 1) : showLoginPrompt()}
                                    disabled={!isDisponibile}>
                                    Aggiungi al carrello
                                </button>

                                {isDisponibile &&
                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition">
                                        Acquista Ora
                                    </button>}

                                {}

                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-8 bg-white p-6 rounded-lg " style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>
                    <h2 className="text-xl font-semibold mb-2">Descrizione</h2>

                    <div
                        dangerouslySetInnerHTML={{__html: book.descrizione.descrizioneHtml}}
                        className="prose proselg max-w-none
                        prose-headings:text-gray-800
                        prose-p:text-gray-700
                          prose-blockquote:border-l-4 prose-blockquote:border-gray-500 prose-blockquote:bg-gray-100 prose-blockquote:p-2"
                    />
                </div>

                <div className="my-8 bg-white p-6 rounded-lg " style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>
                    <BookInfoTabs book={book}/>
                </div>

                <div className="my-8 bg-white p-6 rounded-lg border-2 border-gray-200 "
                     style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>
                    <h2 className="text-xl font-semibold mb-2">Recensioni</h2>
                    <p className="text-gray-600 mb-10">Le recensioni degli utenti</p>

                    {reviews.length === 0 &&
                        <p className="text-gray-500">Non ci sono recensioni per questo libro</p>}

                    <div className="space-y-6">
                        {reviews.map((r) => {
                            const recensione = r.recensione;

                            return <div className="border-b border-gray-200 pb-4 last:border-0 "
                                        key={recensione.id} id={`review-${recensione.id}`} tabIndex="-1"
                            >

                                <div className="flex items-center  mb-1 ">
                                    <span
                                        className="text-yellow-500 text-2xl">{'★'.repeat(recensione.stelle)}{'☆'.repeat(5 - recensione.stelle)}</span>

                                    <span className="ml-2 font-bold">{recensione.titolo}</span>
                                </div>

                                <p className="text-gray-500 text-sm mb-4">
                                    Pubblicato
                                    il {new Date(recensione.dataCreazione).toLocaleDateString()} da {r.username}
                                </p>

                                {recensione.testo !== "" && <p className="mb-4">{recensione.testo}</p>}

                                <div className="flex gap-4 ">
                                    {recensione.approvato &&
                                        <span className="text-green-600 font-bold">Approvato</span>
                                    }
                                    {recensione.consigliato &&
                                        <span className="text-blue-600 font-bold">Consigliato</span>
                                    }
                                </div>

                                {recensione.dataCreazione !== recensione.dataModifica &&
                                    <p className="text-gray-500 text-sm mt-2">
                                        Ultima modifica: {recensione.dataModifica}
                                    </p>}
                            </div>
                        })}
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition"
                            onClick={() => navigate(`/book/${bookId}/recensioni/nuova`)}>
                            Pubblica una recensione
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Amministrazione</h3>
                    <p className="text-gray-600 mb-4">Comandi utili per la gestione del libro</p>

                    <div className="flex flex-wrap gap-4 items-center">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition">
                            Modifica
                        </button>

                        <div className="flex flex-wrap gap-2 items-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="file:mr-4 cursor-pointer file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-600 dark:file:text-white dark:hover:file:bg-blue-700 ..."/>
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                                onClick={handleUpload}
                            >
                                Carica foto
                            </button>
                        </div>

                        <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition">
                            Elimina
                        </button>
                    </div>
                </div>
            </div>
            ,

            <div key="book-navigation" className="flex justify-center gap-4 my-8">
                {previousBookExists && (
                    <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition"
                        onClick={handlePreviousBook}
                    >
                        Precedente
                    </button>
                )}

                {nextBookExists && (
                    <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition"
                        onClick={handleNextBook}
                    >
                        Successivo
                    </button>
                )}
            </div>
        </>
    );
};

export default BookInfo;