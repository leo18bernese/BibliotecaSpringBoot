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
        throw error;
    }
}

const uploadImages = async (bookId, files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('images', file);
    });

    const { data } = await axios.post(`/api/images/${bookId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

const API_URL = '/api/images';

const AdminBookImages = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const {data: bookExists, isLoading: isBookExistsLoading, error: bookExistsError} = useQuery({
        queryKey: ['bookExists', id],
        queryFn: () => fetchBookExists(id),
    });

    const {data: images, isLoading: areImagesLoading} = useQuery({
        queryKey: ['images', id],
        queryFn: () => fetchImageIds(id),
    });

    const deleteImage = async (bookId, imageIndex) => {
        const { data } = await axios.delete(`${API_URL}/${bookId}/index/${imageIndex}`);
        return data;
    };

    const deleteMutation = useMutation({
        mutationFn: ({ bookId, imageIndex }) => deleteImage(bookId, imageIndex),
        onSuccess: () => {
            queryClient.invalidateQueries(['images', id]);
            toast.success('Immagine eliminata con successo');
        },
        onError: () => {
            toast.error('Errore durante l\'eliminazione dell\'immagine');
        }
    });

    const uploadMutation = useMutation({
        mutationFn: (files) => uploadImages(id, files),
        onSuccess: () => {
            queryClient.invalidateQueries(['images', id]);
            toast.success('Immagini caricate con successo');
        },
        onError: () => {
            toast.error('Errore durante il caricamento delle immagini');
        }
    });

    const handleDeleteImage = (imageIndex) => {
        if (window.confirm('Sei sicuro di voler eliminare questa immagine?')) {
            deleteMutation.mutate({ bookId: id, imageIndex });
        }
    };

    const handleFileSelect = (files) => {
        if (files && files.length > 0) {
            const validFiles = Array.from(files).filter(file =>
                file.type.startsWith('image/')
            );

            if (validFiles.length === 0) {
                toast.error('Seleziona solo file immagine');
                return;
            }

            uploadMutation.mutate(validFiles);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    if (isBookExistsLoading || areImagesLoading) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    if (bookExistsError) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Error loading book data.
                </div>
            </div>
        );
    }

    if (!bookExists) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    Book not found.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Book Images Manager</h1>
                <p className="text-sm text-gray-600">
                    Gestisci le immagini del libro. Puoi caricare nuove immagini trascinandole qui sotto o cliccando sul pulsante di caricamento.
                </p>
            </div>

            {/* Upload Section */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Carica Nuove Immagini</h2>

                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragOver
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className="flex flex-col items-center space-y-4">

                        <div>
                            <p className="text-lg font-medium text-gray-700 mb-2">
                                Trascina le immagini qui o clicca per selezionare
                            </p>
                            <p className="text-sm text-gray-500">
                                Formati supportati: JPG, PNG, GIF, WebP
                            </p>
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadMutation.isLoading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploadMutation.isLoading ? 'Caricamento...' : 'Seleziona File'}
                        </button>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                />
            </div>

            {/* Images Grid */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Immagini Esistenti {images > 0 && `(${images})`}
                </h2>

                {images === -1 || images === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">Nessuna immagine trovata</p>
                        <p className="text-gray-400 text-sm">Carica la prima immagine per questo libro</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: images }, (_, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative">
                                    <img
                                        src={`${API_URL}/${id}/index/${index}`}
                                        alt={`Book Image ${index + 1}`}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA3NEg4M1Y3OEg4N1Y3NFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyNyAxMDZIMTIzVjExMEgxMjdWMTA2WiIgZmlsbD0iIzlDQTRBRiIvPgo8cGF0aCBkPSJNOTMgMTAySDg5VjEwNkg5M1YxMDJaIiBmaWxsPSIjOUNBNEFGIi8+Cjwvc3ZnPgo=';
                                        }}
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                            {index + 1}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">
                                            Immagine {index + 1}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteImage(index)}
                                            disabled={deleteMutation.isLoading}
                                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deleteMutation.isLoading ? 'Eliminando...' : 'Elimina'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminBookImages;