import React, {useContext} from "react";
import {UserContext} from "../user/UserContext";
import LiteCategory from "./LiteCategory";

function CategoryDisplay({idList, contentList, isLoading, error, gridCss}) {
    const list = idList || contentList;

    const gridClass = gridCss || "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8";

    if (isLoading || !list) {
        return <h2 className="text-center">We are loading the categories...</h2>;
    }

    if (error) {
        return <p>Error loading categories: {error.message}</p>;
    }

    if (list.length === 0) {
        return <p>Nessuna categoria trovata.</p>;
    }

    return (
        <div className={`grid ${gridClass}`}>
            {idList ? (
                idList.slice(0, 5).map(id => (
                    <LiteCategory categoryID={id} key={id}/>
                ))
            ) : contentList ? (
                contentList.slice(0, 5).map(book => (
                    <LiteCategory category={book} key={book.id}/>
                ))
            ) : (
                <p>Formato dati non valido.</p>
            )}
        </div>
    );
}

export default CategoryDisplay;