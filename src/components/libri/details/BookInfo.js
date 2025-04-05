// src/components/SearchBooks.js
import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";
import ImageGallery from "../images/ImageGallery";
import {CartContext} from "../../carrello/CartContext";

const API_URL = 'http://localhost:8080/api/images';

const BookInfo = () => {
    const {id} = useParams();

    const previousId = Number.parseInt(id) - 1;
    const nextId = Number.parseInt(id) + 1;

    const [book, setBook] = useState({});
    const [previousBook, setPreviousBook] = useState({});
    const [nextBook, setNextBook] = useState({});

    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [file, setFile] = useState(null);

    const [recensioni, setRecensioni] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const rifornimento = book.rifornimento;

    const {addItem} = useContext(CartContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookResponse = await axios.get(`/api/libri/${id}`);
                setBook(bookResponse.data);

                const previousBookResponse = await axios.get(`/api/libri/exists/${previousId}`);
                setPreviousBook(previousBookResponse.data);

                const nextBookResponse = await axios.get(`/api/libri/exists/${nextId}`);
                setNextBook(nextBookResponse.data);

                try {
                    const imagesResponse = await axios.get(`/api/images/${id}`);
                    if (imagesResponse.status === 200) {
                        let data = imagesResponse.data;
                        setImages(data);

                        if (data.length > 0) {
                            setSelectedImage(data[0]);
                        }
                    }
                } catch (imageError) {
                    // If 404 or any other error, just set images to empty array without failing
                    console.warn("No images found for this book:", imageError);
                    setImages([]);
                    setSelectedImage(null);
                }


                const recensioniResponse = await axios.get(`/api/recensioni/all/${id}`);
                const recensioni = recensioniResponse.data;
                const userRequests = recensioni.map(recensione =>
                    axios.get(`/api/utenti/username/${recensione.utenteId}`)
                        .then(userResponse => ({
                            ...recensione,
                            utente: userResponse.data
                        }))
                );

                const recensioniWithUsername = await Promise.all(userRequests);
                setRecensioni(recensioniWithUsername);

                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id, nextId, previousId]);

    const handlePreviousBook = () => {
        if (previousBook) {
            window.location.href = `/libri/${previousId}`;
        }
    }

    const handleNextBook = () => {
        if (nextBook) {
            window.location.href = `/libri/${nextId}`;
        }
    }

    const handleUpload = () => {
        const formData = new FormData();
        formData.append('file', file);

        axios.post(`/api/images/${id}`, formData, {
            headers: {
                "Authorization": `Bearer ${Cookies.get('XSRF-TOKEN')}`,
                'Content-Type': 'multipart/form-data',
                'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN')
            },
            withCredentials: true
        })
            .then(response => {
                console.log('File uploaded successfully:', response.data);
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
    }

    console.log(loading + " " + error + " " + book);
    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Caricamento...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen">Errore: {error.response.statusText}</div>;
    }

    if (!book || Object.keys(book).length === 0) {
        return <div className="flex justify-center items-center min-h-screen">Libro non trovato</div>;
    }

    return [
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                    <ImageGallery id={id} images={images} API_URL={API_URL}/>
                </div>

                <div className="md:w-1/2">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-4">{book.titolo}</h1>
                        <p className="mb-2"><strong>Autore:</strong> {book.autore}</p>
                        <p className="mb-4"><strong>Genere:</strong> {book.genere}</p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-8 border-2 border-gray-300">
                        <h3 className="text-xl font-semibold mb-4">Acquisto</h3>
                        <p className="text-lg mb-2">Prezzo: {rifornimento.prezzo} €</p>
                        <p className="mb-4"><b className="font-bold"
                                               style={{color: rifornimento.color}}>{rifornimento.status}</b></p>
                        <div className="flex flex-wrap gap-2">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                                    onClick={addItem(book.id, 1)}>
                                Aggiungi al carrello
                            </button>
                            <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition">
                                Acquista
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="my-8 bg-white p-6 rounded-lg border-2 border-gray-200 ">
                <h2 className="text-xl font-semibold mb-2">Recensioni</h2>
                <p className="text-gray-600 mb-10">Le recensioni degli utenti</p>

                {recensioni.length === 0 && <p className="text-gray-500">Non ci sono recensioni per questo libro</p>}

                <div className="space-y-6">
                    {recensioni.map((recensione) => (
                        <div className="border-b border-gray-200 pb-4 last:border-0" key={recensione.id}>

                            <p className="font-medium">{recensione.utente}</p>
                            <div className="flex items-center gap-2 mb-1">
                                <span>{'⭐'.repeat(recensione.stelle)}</span>
                                <span className="font-bold">{recensione.titolo}</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-4">
                                Pubblicato il {new Date(recensione.dataCreazione).toLocaleDateString()}
                            </p>

                            {recensione.testo !== "" && <p className="mb-4">{recensione.testo}</p>}

                            <div className="flex gap-4 text-sm">
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
                    ))}
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
                            class="file:mr-4 cursor-pointer file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-600 dark:file:text-white dark:hover:file:bg-blue-700 ..."/>
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
        </div>,

        <div key="book-navigation" className="flex justify-center gap-4 my-8">
            {previousBook && (
                <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition"
                    onClick={handlePreviousBook}
                >
                    Precedente
                </button>
            )}

            {nextBook && (
                <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition"
                    onClick={handleNextBook}
                >
                    Successivo
                </button>
            )}
        </div>
    ];
};

export default BookInfo;