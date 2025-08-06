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
import {Button} from "antd";

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

const AdminBookOverview = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();


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
            <h1 className="text-lg font-semibold">Manage Book #{id}</h1>
            <p className="text-sm text-gray-500">
                Choose what you want to edit for this book.
                You're able to edit the book details or manage other aspects like inventory and suppliers.
            </p>

            <div className="mt-8">

                <button
                    className="p-3 bg-blue-400 text-white font-semibold rounded-md hover:bg-blue-500 transition-colors"
                    onClick={() => navigate(`/admin/book/${id}/edit`)}
                >
                    Edit Book Details
                </button>

                <button
                    className="p-3 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors ml-4 mb-3"
                    onClick={() => navigate(`/admin/book/${id}/images`)}
                >
                    Manage Images
                </button>

                <br/>

                <button
                    className="p-3 bg-green-500 text-white font-semibold  rounded-md hover:bg-green-600 transition-colors mb-8 "
                    onClick={() => navigate(`/admin/book/${id}/inventory`)}
                >
                    Manage Inventory and Suppliers
                </button>

                <br/>

                <button
                    className="p-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
                    onClick={() => navigate(`/admin/book/${id}/delete`)}
                >
                    Delete Book
                </button>


            </div>
        </div>
    );

}

export default AdminBookOverview;