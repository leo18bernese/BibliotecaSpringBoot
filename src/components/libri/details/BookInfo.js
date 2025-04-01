// src/components/SearchBooks.js
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import '../Books.css';
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";

const BookInfo = () => {

        const {id} = useParams();

        const previousId = Number.parseInt(id) - 1;
        const nextId = Number.parseInt(id) + 1;

        const [book, setBook] = useState({});
        const [previousBook, setPreviousBook] = useState({});
        const [nextBook, setNextBook] = useState({});

        const [images, setImages] = useState([]);
        const [file, setFile] = useState(null);

        const [recensioni, setRecensioni] = useState([]);

        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const rifornimento = book.rifornimento;


        useEffect(() => {
            const fetchData = async () => {
                try {
                    const bookResponse = await axios.get(`/api/libri/${id}`);
                    setBook(bookResponse.data);

                    const previousBookResponse = await axios.get(`/api/libri/exists/${previousId}`);
                    setPreviousBook(previousBookResponse.data);

                    const nextBookResponse = await axios.get(`/api/libri/exists/${nextId}`);
                    setNextBook(nextBookResponse.data);

                    console.log("imagesResponse 1");
                    const imagesResponse = await axios.get(`/api/images/${id}`, {
                        responseType: 'arraybuffer',
                    }).then(response => {
                        const base64 = btoa(
                            new Uint8Array(imagesResponse.data).reduce(
                                (data, byte) => data + String.fromCharCode(byte),
                                ''
                            )
                        );
                        setImages(`data:${imagesResponse.headers['content-type']};base64,${base64}`);
                    })
                        .catch(() => {
                            console.warn("No image found for this book");
                            setLoading(false);
                        });

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
                    "Authorization": `Bearer ${ Cookies.get('XSRF-TOKEN')}`,
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
            return <div className={"centered"}>Caricamento...</div>;
        }

        if (error) {
            return <div className={"centered"}>Errore: {error.response.statusText}</div>;
        }

        if (!book || Object.keys(book).length === 0) {
            return <div className={"centered"}>Libro non trovato</div>;
        }

        return [
            <div className={"book-page"}>


                <div className={"side"}>
                    <div className={"left"}>
                        <h2>{book.titolo}</h2>
                        <p><strong>Autore:</strong> {book.autore}</p>
                        <p><strong>Genere:</strong> {book.genere}</p>

                        {images && images.length > 0 && (
                            <img src={images} alt="Book Cover" className={"book-cover"}/>
                        )}

                    </div>

                    <div className={"section"}>
                        <h3>Acquisto</h3>

                        <p style={{fontSize: 18}}>Prezzo: {rifornimento.prezzo} €</p>

                        <p><b style={{color: rifornimento.color}}>{rifornimento.status}</b></p>


                        <button className={"button"}>Aggiungi al carrello</button>
                        <button className={"button"}>Acquista</button>
                    </div>
                </div>


                <div className={"large-section"}>
                    <h3>Recensioni</h3>
                    <p>Le recensioni degli utenti</p>

                    {recensioni.length === 0 && <p>Non ci sono recensioni per questo libro</p>}

                    {recensioni.map(
                        (recensione) => {
                            return (
                                <div className={"recensione"} key={recensione.id}>
                                    <p>{recensione.utente}</p>


                                    <a>{'⭐'.repeat(recensione.stelle)} <b>{recensione.titolo}</b></a> <br/>
                                    <a className={"publish"}>Pubblicato
                                        il {new Date(recensione.dataCreazione).toLocaleDateString()}</a>

                                    <div className={"margin-top"}>
                                        {recensione.testo !== "" && <p>{recensione.testo}</p>}
                                    </div>

                                    <div>
                                        {recensione.approvato && <a style={{color: "green"}}><b>Approvato</b></a>} <br/>
                                        {recensione.consigliato && <a style={{color: "blue"}}><b>Consigliato</b></a>}
                                    </div>

                                    {recensione.dataCreazione !== recensione.dataModifica &&
                                        <p>Ultima modifica: {recensione.dataModifica}</p>}
                                </div>
                            )
                        }
                    )}
                </div>


                <div className={"section"}>
                    <h3>Amministrazione</h3>
                    <p>Comandi utili per la gestione del libro</p>

                    <button className="button">Modifica</button>

                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])}/>
                    <button className="button" onClick={handleUpload}>Carica foto</button>

                    <button className="button">Elimina</button>
                </div>

            </div>
            ,


            <div key="book-navigation" className={"book-navigation"}>

                {previousBook && (
                    <button className="button" onClick={handlePreviousBook}>Precedente</button>
                )}

                {nextBook && (
                    <button className="button" onClick={handleNextBook}>Successivo</button>
                )}
            </div>
        ];
    }
;

export default BookInfo;