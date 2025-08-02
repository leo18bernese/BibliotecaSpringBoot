import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import EditableField from "./EditableField";
import React, {useState} from "react";

const fetchBookById = async (id) => {
    const {data} = await axios.get(`/api/libri/${id}`);
    console.log("fetched book data:", data);
    return data;
};

const fetchBookExists = async (id) => {
    if (!id || id <= 0) return false;
    const {data} = await axios.get(`/api/libri/exists/${id}`);
    return data;
}

const fetchImageIds = async (id) => {
    try {
        const {data} = await axios.get(`/api/images/${id}`);
        return data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn("No images found for this book:", error);
            return -1;
        }

        throw error; // Rethrow other errors
    }
}

const AdminBook = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("ciao sono il titolo");
    const [author, setAuthor] = useState("ciao sono l'autore");
    const [annoPubblicazione, setAnnoPubblicazione] = useState("2025");
    const [produttore, setProduttore] = useState("ciao sono il produttore");

    const {data: book, isLoading: isBookLoading, error: bookError} = useQuery({
        queryKey: ['book', id],
        queryFn: () => fetchBookById(id),
    });

    const {data: bookExists, isLoading: isBookExistsLoading, error: bookExistsError} = useQuery({
        queryKey: ['bookExists', id],
        queryFn: () => fetchBookExists(id),
    });

    const {data: images, isLoading: areImagesLoading} = useQuery({
        queryKey: ['images', id],
        queryFn: () => fetchImageIds(id),
    });

    if (isBookLoading || isBookExistsLoading || areImagesLoading) {
        return <div>Loading...</div>;
    }

    if (bookError || bookExistsError) {
        return <div>Error loading book data.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-lg font-semibold">Book Editor</h1>
            <p className="text-sm text-gray-500">
                You can edit the book details, such as title, author, and description here.
                You can't change the storage information, such as the number of copies or the location.
            </p>

            <div className="mt-4">
                <h2 className="text-md font-semibold">Book Details</h2>

                <EditableField id="title" label="Title" icon="book"
                               value={title}
                               placeholder="Enter book title"
                               minChars={2} maxChars={30}
                               onChange={(newTitle) => {
                                   setTitle(newTitle);
                               }}
                />

                <EditableField id="author" label="Author" icon="user"
                               value={author}
                               placeholder="Enter author name"
                               minChars={2} maxChars={30}
                               onChange={(newAuthor) => {
                                      setAuthor(newAuthor);
                                 }}
                />

                <EditableField id="annoPubblicazione" label="Publication Year" icon="calendar"
                               value={annoPubblicazione}
                               placeholder="Enter publication year"
                               minChars={1700} maxChars={2025}
                                 type="number"
                               onChange={(newAnno) => {
                                   setAnnoPubblicazione(newAnno);
                               }}
                />

                <EditableField id="produttore" label="Publisher" icon="building"
                               value={produttore}
                               placeholder="Enter publisher name"
                               minChars={2} maxChars={30}
                               onChange={(newProduttore) => {
                                   setProduttore(newProduttore);
                               }}
                />
            </div>
        </div>
    );

}

export default AdminBook;