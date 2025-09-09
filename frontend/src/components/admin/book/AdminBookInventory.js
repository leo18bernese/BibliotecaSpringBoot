import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import ButtonField from "./fields/ButtonField";
import {usePageTitle} from "../../utils/usePageTitle";
import CreateVariant from "./variant/CreateVariant";

const fetchBookById = async (id) => {
    const {data} = await axios.get(`/api/libri/${id}`);
    return data;
};

const fetchBookExists = async (id) => {
    if (!id || id <= 0) return false;
    const {data} = await axios.get(`/api/libri/exists/${id}`);
    return data;
};

// Nuova funzione per fetch delle prenotazioni
const fetchPrenotazioni = async (id) => {
    if (!id || id <= 0) return [];
    const {data} = await axios.get(`/api/rifornimento/${id}/prenotazioni`);
    return data.content || [];
};

const AdminBookInventory = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [showAddVariantPopup, setShowAddVariantPopup] = useState(false);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const {data: book, isLoading: isBookLoading, error: bookError} = useQuery({
        queryKey: ['book', id],
        queryFn: () => fetchBookById(id),
    });

    const {data: bookExists, isLoading: isBookExistsLoading, error: bookExistsError} = useQuery({
        queryKey: ['bookExists', id],
        queryFn: () => fetchBookExists(id),
    });

    // Inizializza gli stati quando book è disponibile
    useEffect(() => {
        if (book) {

        }
    }, [book]);


    const handleSave = () => {
        setHasUnsavedChanges(false);
        navigate("/admin/book/" + id);
    };


    useEffect(() => {
        if (!hasUnsavedChanges) return;
        const handlePopState = (event) => {
            const confirmLeave = window.confirm(
                'Hai modifiche non salvate. Sei sicuro di voler lasciare questa pagina?'
            );
            if (!confirmLeave) {
                window.history.pushState(null, '', window.location.pathname);
            } else {
                setHasUnsavedChanges(false);
            }
        };
        window.history.pushState(null, '', window.location.pathname);
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasUnsavedChanges]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = 'Hai modifiche non salvate. Sei sicuro di voler lasciare questa pagina?';
                return event.returnValue;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    usePageTitle('Book #' + id + ' - Inventory');

    console.log(book);

    if (isBookLoading || isBookExistsLoading) {
        return <div>Loading...</div>;
    }

    if (bookError || bookExistsError) {
        return <div>Error loading book data.</div>;
    }

    if (!book || !bookExists) {
        return <div className="p-4">Book not found or does not exist.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-lg font-semibold">Book Inventory Management</h1>
            <p className="text-sm text-gray-500">
                Manage the inventory and storage details of this book. <br/>
                You can edit available quantity, add storage locations, and update stock information. <br/>
                You can also edit the price, create discounts, and manage other inventory-related details.
            </p>

            <button
                className="flex items-center border-2  border-green-500 px-4 py-3 rounded-md
                 bg-green-100 hover:bg-green-200 w-1/3 transition"
                onClick={() => setShowAddVariantPopup(true)}
            >

                <i className='bx bx-plus-circle text-2xl text-green-600'></i>
                <span className="ml-2 font-semibold text-green-700">
                    Aggiungi Nuova Variante</span>

            </button>

            <div className="mt-8 p-4 bg-gray-50 rounded-md w-1/3">
                <h2 className="text-md font-semibold rounded-md">Seleziona una variante qui sotto</h2>


                {book.varianti.map((variante) => (
                    <div key={variante.id} className="mt-4 p-4 border rounded-md bg-white">

                        <div className="flex items-center justify-between">
                            <div>

                                <h3 className="text-md font-semibold mb-2">{variante.nome}</h3>
                                <p className="text-sm text-gray-600 mb-4">{variante.descrizione}</p>
                            </div>

                            <div>

                                <button className="ml-2 hover:text-blue-600"
                                        onClick={(e) => {
                                            navigate("/admin/book/" + id + "/inventory/variante/" + variante.id);
                                        }}
                                        title="Modifica indirizzo">
                                    <i className="bx bx-edit text-2xl"></i>
                                </button>

                                <button className="ml-2 hover:text-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toast("Delete functionality not implemented yet.");
                                        }}
                                        title="Elimina indirizzo">
                                    <i className="bx bx-trash text-2xl"></i>
                                </button>

                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CreateVariant bookId={id}
                           setShowAddVariantPopup={setShowAddVariantPopup}
                           showAddVariantPopup={showAddVariantPopup}
            />

            <div className="fixed bottom-4 right-4">
                <button
                    onClick={handleSave}
                    className={`px-6 py-3 text-white rounded-lg transition-colors duration-200
                  ${hasUnsavedChanges ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                    disabled={!hasUnsavedChanges}
                >
                    {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
                </button>
            </div>
        </div>
    );
};

export default AdminBookInventory;
