// src/components/LibriList.js
import React, {useState, useEffect} from 'react';
import axios from 'axios';

const LibriList = () => {
    const [libri, setLibri] = useState([]);

    useEffect(() => {
        axios.get('/api/libri')
            .then(response => {
                setLibri(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the libri!', error);
            });
    }, []);

    return (
        <div>
            <h1>Libri List</h1>
            <ol>
                {libri.map(libro => (
                    <li key={libro.id}>
                        {libro.titolo} - {libro.autore.nome} - {libro.genere}
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default LibriList;