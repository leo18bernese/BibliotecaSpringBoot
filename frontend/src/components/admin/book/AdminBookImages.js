import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import EditableField from "./EditableField";
import React, {useEffect, useMemo, useRef, useState} from "react";
import DescriptionEditor from "../../libri/details/DescriptionEditor";
import RemovableField from "./RemovableField";
import toast from "react-hot-toast";
import MaskedSuggestionInput from "./MaskedSuggetionInput";
import CheckableField from "./CheckableField";

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

const fetchAutoriList = async () => {
    const {data} = await axios.get('/api/autori');
    return data;
}

const updateBook = async ({id, bookData}) => {
    const {data} = await axios.put(`/api/libri/${id}`, bookData);
    return data;
}


const AdminBookImages = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {data: bookExists, isLoading: isBookExistsLoading, error: bookExistsError} = useQuery({
        queryKey: ['bookExists', id],
        queryFn: () => fetchBookExists(id),

    });

    const {data: images, isLoading: areImagesLoading} = useQuery({
        queryKey: ['images', id],
        queryFn: () => fetchImageIds(id),
    });

    if ( isBookExistsLoading || areImagesLoading) {
        return <div>Loading...</div>;
    }

    if ( bookExistsError) {
        return <div>Error loading book data.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-lg font-semibold">Book Editor</h1>
            <p className="text-sm text-gray-500">
                You can edit the book details, such as title, author, and description here.
                You can't change the storage information, such as the number of copies or the location.
            </p>

            <div className="mt-8 p-4">
                <h2 className="text-md font-semibold">Book Details</h2>

                <div className="mt-4 flex flex-wrap justify-center items-center">

                    {Array.from({ length: Math.min(images, 10) }, (_, image) => (
                        <div key={image} className="relative cursor-pointer " onMouseEnter={() => {
                        }}>
                            <img
                                src={`api/images/${id}/index/${image}`}
                                alt={`Thumbnail ${image}`}
                                className={`w-16 h-16 object-cover rounded border-2 'border-gray-200'
                                }`}/>

                            {image === 9 && images > 10 && (
                                <div
                                    className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-lg font-bold rounded">
                                    +{images - 10}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );

}

export default AdminBookImages;