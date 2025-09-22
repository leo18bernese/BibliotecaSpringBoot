// src/components/BookInfo.js
import React, {useContext, useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import ImageGallery from "../images/ImageGallery";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import toast, {Toaster} from "react-hot-toast";
import BookInfoTabs from "./BookInfoTabs";
import {UserContext} from "../../user/UserContext";
import {useAuth} from "../../user/AuthContext";
import {useCartMutations} from "../../hook/useCartMutations";
import {usePageTitle} from "../../utils/usePageTitle";
import Varianti from "./Varianti";
import RecensioneInfo from "../../recensioni/RecensioneInfo";
import {useAnalyticsMutation} from "../../admin/book/chart/useAnalytics";

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
};

const fetchImageIds = async (id) => {
    try {
        const {data} = await axios.get(`/api/images/${id}`);
        return data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn("No images found for this book:", error);
            return -1;
        }
        throw error;
    }
};

const fetchReviews = async (id) => {
    const {data} = await axios.get(`/api/recensioni/all/${id}`);
    return data;
};

const fetchCartItem = async (bookId, variantId) => {
    try {
        const {data} = await axios.get(`/api/carrello/items/${bookId}/${variantId}`);
        console.log("fetched cart item:", data);
        return data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};

const fetchHasWishlisted = async (id, variantId) => {
    const {data} = await axios.get(`/api/wishlist/has/${id}`);
    console.log("Has wishlisted:", data);
    return data;
};

const BookInfo = () => {
    const {user, isAdmin} = useContext(UserContext);
    const {showLoginPrompt} = useAuth();
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {updateCartItemMutation} = useCartMutations();
    const {addEventMutation} = useAnalyticsMutation();

    const bookId = Number.parseInt(id);
    const previousId = bookId - 1;
    const nextId = bookId + 1;

    const [file, setFile] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null); // State for selected variant

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const focusReview = params.get("focusReview");

    const viewTracked = useRef(false);

    const [quantityToAdd, setQuantityToAdd] = useState(1);

    const {data: book, isLoading: isBookLoading, error: bookError} = useQuery({
        queryKey: ['book', bookId],
        queryFn: () => fetchBookById(bookId),
    });

    const {data: previousBookExists} = useQuery({
        queryKey: ['bookExists', previousId],
        queryFn: () => fetchBookExists(previousId),
        enabled: previousId > 0,
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
        queryKey: ['cartItem', bookId, selectedVariant?.id],
        queryFn: () => fetchCartItem(bookId, selectedVariant?.id),
        enabled: !!user && !!selectedVariant,
    });

    const {data: hasWishlisted} = useQuery({
        queryKey: ['hasWishlisted', bookId, selectedVariant?.id],
        queryFn: () => fetchHasWishlisted(bookId, selectedVariant?.id),
        enabled: !!user && !!selectedVariant,
    });

    //Book viewed tracking
    useEffect(() => {
        if (bookId && user && !viewTracked.current) {
            addViewedBook();
            viewTracked.current = true;
        }
    }, [bookId, user]);


    useEffect(() => {
        if (cartItem) {
            setQuantityToAdd(cartItem.quantita);
        }
    }, [cartItem]);

    const handlePreviousBook = () => {
        if (previousBookExists) {
            navigate(`/book/${previousId}`);
        }
    };

    const handleNextBook = () => {
        if (nextBookExists) {
            navigate(`/book/${nextId}`);
        }
    };

    const addToWishlist = async (bookId, variantId) => {
        if (!user) {
            showLoginPrompt();
            return;
        }
        try {
            const {data} = await axios.post(`/api/wishlist/${bookId}`);
            await queryClient.invalidateQueries(['hasWishlisted', bookId, variantId]);
            return data;
        } catch (error) {
            toast.error("Error adding this item to wishlist.");
            console.error("Error adding to wishlist:", error);
            throw error;
        }
    };

    const removeFromWishlist = async (bookId, variantId) => {
        if (!user) {
            showLoginPrompt();
            return;
        }
        try {
            const {data} = await axios.delete(`/api/wishlist/${bookId}`);
            await queryClient.invalidateQueries(['hasWishlisted', bookId, variantId]);
            return data;
        } catch (error) {
            toast.error("Error removing this item from wishlist.");
            console.error("Error removing from wishlist:", error);
            throw error;
        }
    };

    const updateItem = (quantity) => {
        if (!user) {
            showLoginPrompt();
            return;
        }

        if (!selectedVariant) {
            toast.error('Please select a variant');
            return;
        }

        updateCartItemMutation.mutate({
            bookId: book.id,
            varianteId: selectedVariant.id,
            quantity: quantity,
        });
    }

    const addViewedBook = async () => {
        addEventMutation.mutate({
            productId: bookId,
            eventType: 'VIEW'
        });
    };

    const addViewedImage = async () => {
        addEventMutation.mutate({
            productId: bookId,
            eventType: 'VIEW_IMAGE'
        });
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

    const {pathname} = useLocation();

    useEffect(() => {
        if (book && book.varianti && book.varianti.length > 0 && !selectedVariant) {
            setSelectedVariant(book.varianti[0]);
        }
    }, [book]);


    // Modifica il tuo useEffect per i dati strutturati
    useEffect(() => {
        if (book && selectedVariant && images) {
            const reviewsCount = reviews.length;
            const averageRating = reviewsCount > 0
                ? (reviews.reduce((sum, r) => sum + r.recensione.voto, 0) / reviewsCount)
                : 0;

            const stripHtml = (html) => {
                const tmp = document.createElement("DIV");
                tmp.innerHTML = html;
                return tmp.textContent || tmp.innerText || "";
            }

            // Definisci lo Schema.org con i dati della variante selezionata
            const productSchema = {
                "@context": "https://schema.org/",
                "@type": "Book",
                "name": `${book.titolo} (${selectedVariant.nome})`, // Aggiungi il nome della variante al titolo
                "image": images && images.length > 0 ? `${window.location.origin}/api/images/${book.id}/${images[0].id}` : '',
                "description": stripHtml(book.descrizione.descrizioneHtml),
                "sku": selectedVariant.id, // Usa l'ID della variante come SKU
                "isbn": book.isbn,
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": selectedVariant.prezzo.valuta,
                    "price": selectedVariant.prezzo.prezzoTotale.toFixed(2),
                    "priceValidUntil": new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0], // Fine dell'anno prossimo
                    "availability": selectedVariant.rifornimento.quantita > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                    "shippingDetails": {
                        "@type": "OfferShippingDetails",
                        "shippingRate": {
                            "@type": "MonetaryAmount",
                            "value": 3.90,
                            "currency": "EUR"
                        },
                        "shippingDestination": {
                            "@type": "DefinedRegion",
                            "addressCountry": "IT"
                        }
                    },
                    "hasMerchantReturnPolicy": {
                        "@type": "MerchantReturnPolicy",
                        "applicableCountry": "IT",
                        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                        "merchantReturnDays": 14,
                        "returnMethod": "https://schema.org/ReturnByMail",
                        "returnFees": "https://schema.org/FreeReturn"
                    }
                },
                "aggregateRating": reviewsCount > 0 ? {
                    "@type": "AggregateRating",
                    "ratingValue": averageRating.toFixed(1),
                    "reviewCount": reviewsCount,
                } : undefined,
                "bookEdition": selectedVariant.nome,
                "author": {
                    "@type": "Person",
                    "name": book.autore.nome
                },
                "publisher": book.editore
            };

            // console.log("Generated product schema:", productSchema);
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.innerHTML = JSON.stringify(productSchema);
            document.head.appendChild(script);

            return () => {
                document.head.removeChild(script);
            };
        }
    }, [book, reviews, selectedVariant]);

    usePageTitle(book?.titolo || 'Libro');

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Caricamento...</div>;
    }

    if (bookError) {
        return <div className="flex justify-center items-center min-h-screen">Errore: {bookError.message}</div>;
    }

    if (!book || book.hidden) {
        return (
            <div className="p-4">
                Non siamo riusciti a trovare il libro che stavi cercando.
                Possibili cause:
                <ul className="my-5" style={{listStyleType: 'disc', paddingLeft: '20px'}}>
                    <li>Il libro non esiste o è stato rimosso.</li>
                    <li>Il libro è stato spostato o il suo ID è errato.</li>
                    <li>Il libro non è ancora stato pubblicato.</li>
                </ul>
                La preghiamo di assicurarsi che l'ID del libro sia corretto e che il libro sia disponibile nel nostro
                catalogo.<br/>
                Se il problema persiste, contatti il supporto clienti.
            </div>
        );
    }

    const quantitaDisponibile = selectedVariant?.rifornimento?.quantita || 0;

    const isDisponibile = quantitaDisponibile > 0 &&
        ((quantitaDisponibile - quantityToAdd) >= 0);

    const isUpdateButtonDisabled = !isDisponibile || updateCartItemMutation.isPending ||
        (cartItem && cartItem.quantita === quantityToAdd);

    const isMaxed = (cartItem && cartItem.quantita === quantityToAdd) && quantityToAdd >= quantitaDisponibile;

    const sconto = selectedVariant?.prezzo?.sconto || {};
    const hasSconto = sconto?.percentuale > 0 || sconto?.valore > 0;

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <Toaster/>
                <div className="flex flex-col md:flex-row gap-6">

                    <div className="flex flex-col md:w-2/6 ">

                        <div className=" ">
                            <ImageGallery id={id} images={images} API_URL={API_URL} onView={addViewedImage}/>

                        </div>
                    </div>

                    <div className="md:w-5/12 ">
                        <div className="p-4 bg-white shadow-md rounded-lg">
                            <h1 className="text-2xl font-bold mb-4">{book.titolo}</h1>
                            <div className="text-gray-700 mb-6">
                                <p className="mb-2"><strong>Autore:</strong> {book.autore.nome}</p>
                                <p className="mb-2"><strong>Genere:</strong> {book.genere}</p>
                                <p className="mb-6"><strong>Editore:</strong> {book.editore}</p>
                                <p className="mb-2"><strong>Anno di pubblicazione:</strong> {book.annoPubblicazione}</p>
                                <p className="mb-2"><strong>Numero di pagine:</strong> {book.numeroPagine}</p>
                                <p className="mb-2"><strong>Lingua:</strong> {book.lingua}</p>
                                <p className="mb-2"><strong>ISBN:</strong> {book.isbn}</p>
                            </div>

                            <div className="mt-12">
                                <Varianti varianti={book.varianti}
                                          onSelect={setSelectedVariant}
                                          selected={selectedVariant}
                                ></Varianti>
                            </div>


                        </div>
                    </div>

                    <div className="md:w-3/12 ">

                        <div className="bg-white shadow-md rounded-lg p-4">
                            <h3 className="text-xl font-semibold mb-4">Acquisto</h3>

                            {/* Price and Discount */}
                            {selectedVariant && (
                                <>
                                    <div className="flex items-center space-x-3">
                                        {selectedVariant.prezzo.prezzoTotale < selectedVariant.prezzo.prezzo && (
                                            <p className="text-red-600 text-2xl line-through font-semibold mb-2"
                                               style={{textDecorationThickness: '2px'}}>
                                                {selectedVariant.prezzo.prezzo.toFixed(2)} €
                                            </p>
                                        )}

                                        <p className="text-2xl font-semibold mb-2">
                                            {selectedVariant.prezzo.prezzoTotale.toFixed(2)} €
                                        </p>

                                        <div className="group relative flex items-center">
                                              <span
                                                  className="w-4 h-4 bg-gray-400 text-white text-xs rounded-full flex items-center justify-center cursor-help">
                                                i
                                              </span>
                                            <div
                                                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                Prezzo comprensivo di IVA
                                                <div
                                                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {hasSconto && (
                                        <div
                                            className="p-2 rounded-2xl font-semibold uppercase text-sm mb-5 inline-block"
                                            style={{backgroundColor: '#d1fae5', color: '#065f46'}}>
                                            {sconto.percentuale > 0 ? (
                                                <span>-{sconto.percentuale}% sconto</span>
                                            ) : sconto.valore > 0 && (
                                                <span>-{sconto.valore}€ sconto</span>
                                            )}
                                        </div>
                                    )}

                                    <p className="mb-8">
                                        Variante selezionata: <b>{selectedVariant.nome}</b>
                                    </p>


                                    <p className="mt-1 mb-4">
                                        <b className="text-red-500 font-bold">
                                            {hasWishlisted ? (
                                                <>
                                                    <button
                                                        onClick={() => removeFromWishlist(bookId, selectedVariant.id)}>
                                                        <i className="bxr bxs-heart mr-1.5"></i>
                                                    </button>
                                                    Questo libro è nella tua wishlist!
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => addToWishlist(bookId, selectedVariant.id)}>
                                                        <i className="bxr bx-heart mr-1.5"></i>
                                                    </button>
                                                    Aggiungi alla wishlist
                                                </>
                                            )}
                                        </b>
                                    </p>
                                    <p className="mt-8">
                                        <b className="font-bold" style={{color: selectedVariant.rifornimento.color}}>
                                            {selectedVariant.rifornimento.status}
                                        </b>
                                    </p>

                                    {/*cartItem && cartItem.quantita > 0 ? (
                                        <p className="mb-4">
                                            <b className="text-blue-500 font-bold">
                                                Hai già {cartItem.quantita} unità nel carrello
                                            </b>
                                        </p>
                                    ) : (
                                        <p className="mb-4"></p>
                                    )*/}

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-4 flex-row  ">
                                            <div className="flex gap-3">
                                                <button className="text-blue-500 font-black text-2xl"
                                                        onClick={() => {
                                                            const newQuantity = Math.max(1, quantityToAdd - 1);
                                                            setQuantityToAdd(newQuantity)
                                                        }}>-
                                                </button>

                                                <input type="number"
                                                       className="w-16 text-center border-4 border-blue-500 p-1.5 rounded-lg text-blue-800"
                                                       value={quantityToAdd}
                                                       min={1}
                                                       max={quantitaDisponibile}
                                                       onChange={(e) => {
                                                           const value = Math.max(1, Math.min(quantitaDisponibile, Number.parseInt(e.target.value) || 1));
                                                           setQuantityToAdd(value)
                                                       }}
                                                />

                                                <button className="text-blue-500 font-black text-2xl"
                                                        onClick={() => {
                                                            const newQuantity = Math.min(quantitaDisponibile, quantityToAdd + 1);
                                                            setQuantityToAdd(newQuantity)
                                                        }}>+
                                                </button>
                                            </div>

                                            {isMaxed ?
                                                <button
                                                    className={`flex-grow bg-blue-500 hover:bg-blue-600'} 
                                                    text-white font-semibold py-2 px-4 rounded-xl transition`}
                                                    onClick={() => navigate('/cart')}
                                                >
                                                    Vai al carrello
                                                </button>
                                                :

                                                <button
                                                    className={`flex-grow ${isUpdateButtonDisabled ?
                                                        'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} 
                                                    text-white font-semibold py-2 px-4 rounded-xl transition`}
                                                    onClick={() => updateItem(quantityToAdd)}
                                                    disabled={isUpdateButtonDisabled}
                                                >
                                                    {updateCartItemMutation.isPending ? 'Aggiungendo...' :
                                                        (cartItem && cartItem.quantita > 0) ? 'Aggiorna quantità' :
                                                            'Aggiungi al carrello'
                                                    }
                                                </button>
                                            }
                                        </div>

                                        {isDisponibile && (
                                            <button
                                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition">
                                                Acquista Ora
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {user && isAdmin && (
                        <div className="bg-white shadow-md rounded-lg p-4 mt-4">
                            <h3 className="text-xl font-semibold mb-4">Admin Actions</h3>

                            <button
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition mr-2"
                                onClick={() => navigate(`/admin/book/${book.id}`)}>
                                Gestisci Libro
                            </button>
                        </div>
                        )}
                    </div>
                </div>

                <div className="my-8 bg-white p-6 rounded-lg" style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>
                    <h2 className="text-xl font-semibold mb-2">Descrizione</h2>
                    <div
                        dangerouslySetInnerHTML={{__html: book.descrizione.descrizioneHtml}}
                        className="prose proselg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-gray-500 prose-blockquote:bg-gray-100 prose-blockquote:p-2"
                    />
                </div>

                <div className="my-8 bg-white p-6 rounded-lg" style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>
                    <BookInfoTabs book={book}/>
                </div>

                <div className="my-8 bg-white p-6 rounded-lg border-2 border-gray-200"
                     style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>
                    <h2 className="text-xl font-semibold mb-2">Recensioni</h2>
                    <p className="text-gray-600 mb-10">Le recensioni degli utenti</p>

                    {reviews.length === 0 && (
                        <p className="text-gray-500">Non ci sono recensioni per questo libro</p>
                    )}

                    <div className="space-y-6">
                        {reviews.map((r) => {

                            return <RecensioneInfo key={r.recensione.id} recensione={r.recensione}
                                                   username={r.username}/>;

                        })}
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition"
                            onClick={() => navigate(`/book/${bookId}/recensioni/nuova`)}
                        >
                            Pubblica una recensione
                        </button>
                    </div>
                </div>
            </div>
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
    )
        ;
};

export default BookInfo;

