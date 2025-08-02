import LiteBook from "./lite/LiteBook";
import React from "react";

function BookDisplay({idList, contentList, isLoading, error}) {

    const list = idList || contentList;

    console.log(list);

    return <div
        className="homepage-items grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 p-10">

        {(isLoading || !list) ? (
            <p>Loading...</p>

        ) : error ? (
            <p>Error loading items: {error.message}</p>

        ) : list.length === 0 ? (
            <p>Nessun libro trovato.</p>

        ) : idList ? (
            idList.map(item => (
                <LiteBook bookID={item} key={item}/>
            ))

        ) : contentList ? (
            contentList.map(item => (
                <LiteBook book={item} key={item}/>
            ))

        ) : (
            <p>Invalid data format.</p>
        )}
    </div>
}

export default BookDisplay;