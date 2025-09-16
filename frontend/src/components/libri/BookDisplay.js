import LiteBook from "./lite/LiteBook";
import React, {useContext, useEffect} from "react";
import axios from "axios";
import {UserContext} from "../user/UserContext";

function BookDisplay({idList, contentList, isLoading, error}) {
    const list = idList || contentList;
    const {user} = useContext(UserContext);
    console.log("User context in BookDisplay:", user);

    // Simulate impression tracking on component mount
    useEffect(() => {
        if (idList) {
            idList.forEach(productId => {
                trackImpression(productId);
            });
        } else if (contentList) {
            contentList.forEach(book => {
                trackImpression(book.id);
            });
        }
    }, [idList, contentList]);

    const trackImpression = async (productId) => {
        try {
            const formData = new FormData();
            formData.append('productId', productId);
            formData.append('eventType', 'IMPRESSION');

            await axios.post('http://localhost:8080/api/analytics/events', formData);
            console.log(`Impressione tracciata con successo per il prodotto: ${productId}`);
        } catch (error) {
            console.error(`Errore nel tracciamento dell'impressione per il prodotto: ${productId}`, error);
        }
    };

    if (isLoading || !list) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error loading items: {error.message}</p>;
    }

    if (list.length === 0) {
        return <p>Nessun libro trovato.</p>;
    }

    return (
        <div className="homepage-items grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 p-10">
            {idList ? (
                idList.map(id => (
                    <LiteBook bookID={id} key={id}/>
                ))
            ) : contentList ? (
                contentList.map(book => (
                    <LiteBook book={book} key={book.id}/>
                ))
            ) : (
                <p>Formato dati non valido.</p>
            )}
        </div>
    );
}

export default BookDisplay;