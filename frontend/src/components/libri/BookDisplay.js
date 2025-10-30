import LiteBook from "./lite/LiteBook";
import React, {useContext, useEffect, useRef} from "react";
import {UserContext} from "../user/UserContext";
import {useAnalyticsMutation} from "../admin/book/chart/useAnalytics";

function BookDisplay({idList, contentList, isLoading, error, gridCss}) {
    const list = idList || contentList;
    const {user} = useContext(UserContext);

    const gridClass = gridCss || "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 ";

    const {addEventMutation} = useAnalyticsMutation();

    console.log("User context in BookDisplay:", user);

    const impressionTracked = useRef(false);

    // Simulate impression tracking on component mount
    useEffect(() => {
        if (!impressionTracked.current && (idList || contentList)) {
            const list = idList || contentList;
            list.forEach(item => {
                const productId = item.id || item;
                trackImpression(productId);
            });
            impressionTracked.current = true;
        }
    }, [idList, contentList]);

    const trackImpression = async (productId) => {
        addEventMutation.mutate({
            productId: productId,
            eventType: 'IMPRESSION'
        });
    };

    if (isLoading || !list) {
        return <h2 className="text-center">We are loading the books...</h2>;
    }

    if (error) {
        return <p>Error loading items: {error.message}</p>;
    }

    if (list.length === 0) {
        return <p>Nessun libro trovato.</p>;
    }

    return (
        <div className={`homepage-items grid ${gridClass}`}>
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