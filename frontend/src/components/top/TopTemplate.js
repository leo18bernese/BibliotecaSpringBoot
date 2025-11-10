import {UserContext} from "../user/UserContext";
import React, {useContext} from "react";
import LiteBookLong from "../libri/lite/LiteBookLong";



const TopTemplate = ({idList, contentList, title, description, isLoading, error}) => {
    const list = idList || contentList;
    const {user} = useContext(UserContext);

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
        <div className="container mx-auto mt-8">
            <div className="flex flex-col mb-4">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <p className="text-gray-600">{description}</p>
            </div>

            <div className="flex flex-col gap-4">
                {idList ? (
                    idList.map((id, index) => (
                        <LiteBookLong index={index} bookID={id} key={id}/>
                    ))
                ) : contentList ? (
                    contentList.map(book => (
                        <LiteBookLong book={book} key={book.id}/>
                    ))
                ) : (
                    <p>Formato dati non valido.</p>
                )}
            </div>
        </div>
    );
}

export default TopTemplate;