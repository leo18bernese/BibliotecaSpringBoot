// src/components/SearchBooks.js
import React, {useState} from 'react';
import axios from 'axios';
import '../Books.css';
import {Link} from "react-router-dom";

const SearchBooks = () => {
    const [keyword, setKeyword] = useState('');
    const [books, setBooks] = useState([]);

    const handleSearch = (keyword) => {
        axios.get(`/api/libri/search/${keyword}`)
            .then(response => {
                setBooks(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the books!', error);
            });
    };

    return (
        <div className={"book-page"}>
            <h1>Search Books</h1>
            <input
                type="text"
                onChange={(e) => {
                    handleSearch(e.target.value);
                }}
                placeholder="Enter keyword"
            />
            <button onClick={handleSearch}>Search</button>

            <ul>
                {keyword.length > 0 && books.length === 0 && <li>No books found</li>}

                {books.map(book => (
                    <Link to={`/libri/${book.id}`} key={book.id}>
                        <li>
                            {book.titolo} - {book.autore} - {book.genere}
                        </li>
                    </Link>

                ))}
            </ul>
        </div>
    );
};

export default SearchBooks;