import axios from "axios";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import {usePageTitle} from "../../utils/usePageTitle";
import CreateVariant from "./variant/CreateVariant";
import CreateForm from "../category/create/CreateForm";

const fetchBookById = async (id) => {
    const {data} = await axios.get(`/api/libri/${id}`);
    return data;
};

const fetchBookExists = async (id) => {
    if (!id || id <= 0) return false;
    const {data} = await axios.get(`/api/libri/${id}/exists`);
    return data;
};

const duplicateVariant = async (bookId, variantId) => {
    const {data} = await axios.post(`/api/libri/${bookId}/variante/${variantId}/duplicate`);
    return data;
}

const deleteVariant = async (bookId, variantId) => {
    const {data} = await axios.delete(`/api/libri/${bookId}/variante/${variantId}`);
    return data;
}

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

    const duplicateMutation = useMutation({
        mutationFn: (variantId) => duplicateVariant(id, variantId),
        onSuccess: (data) => {
            toast.success("Variante duplicata con successo");
            queryClient.invalidateQueries({queryKey: ['book', id]});
        },
        onError: (error) => {
            toast.error("Errore durante la duplicazione della variante");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (variantId) => deleteVariant(id, variantId),
        onSuccess: (data) => {
            toast.success("Variante eliminata con successo");
            queryClient.invalidateQueries({queryKey: ['book', id]});
        },
        onError: (error) => {
            toast.error("Errore durante l'eliminazione della variante");
        }
    });

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

            <Link to={`/admin/book/${id}`}
                  className="text-blue-500 hover:underline font-semibold ">
                &larr; Back to Book Details
            </Link>

            <h1 className="text-lg font-semibold mt-4">Book Inventory Management</h1>
            <p className="text-sm text-gray-500">
                Manage the inventory and storage details of this book. <br/>
                You can edit available quantity, add storage locations, and update stock information. <br/>
                You can also edit the price, create discounts, and manage other inventory-related details.
            </p>

            <CreateForm
                endpoint={`/api/libri/${id}/variante`}
                showAddCategoryPopup={showAddVariantPopup}
                setShowAddCategoryPopup={setShowAddVariantPopup}
                showAddMessage="Aggiungi Nuova Variante"
                data={[
                    ['nome', 'Nome Variante', '', 'Name is required'],
                    ['dimensioni.length', 'Lunghezza (cm)', '', 'Length is required', true],
                    ['dimensioni.width', 'Larghezza (cm)', '', 'Width is required', true],
                    ['dimensioni.height', 'Altezza (cm)', '', 'Height is required',true],
                    ['dimensioni.weight', 'Peso (kg)', '', 'Weight is required',true],
                    ['prezzo', 'Prezzo (€)', '', 'Price is required'],
                ]}
            />

            <div className="mt-8 p-4 bg-gray-50 rounded-md">
                <h2 className="text-md font-semibold rounded-md">Seleziona una variante qui sotto</h2>


                <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
                    {book.varianti.map((variante) => (
                        <div key={variante.id} className="mt-4 p-4 border-2 border-gray-400 rounded-md bg-white">

                            <div className="flex items-center justify-between">
                                <div>

                                    <h3 className="text-md font-semibold mb-2">{variante.nome}</h3>
                                    <p className="text-sm text-gray-600 mb-0">Nome basato su
                                        attributi: <b>{variante.dynamicName}</b>
                                    </p>
                                    <p className='text-sm text-gray-600  mb-4 '>
                                        Aggregable: <b
                                        className={variante.aggregable ? 'text-green-600' : 'text-red-600'}>
                                        {variante.aggregable ? 'Sì' : 'No'}</b>
                                    </p>
                                </div>

                                <div>

                                    <button className="ml-2 hover:text-blue-600"
                                            onClick={(e) => {
                                                navigate("/admin/book/" + id + "/inventory/variante/" + variante.id);
                                            }}
                                            title="Modifica variante"
                                            disabled={duplicateMutation.isLoading || deleteMutation.isLoading}
                                    >
                                        <i className="bx bx-edit text-2xl"></i>
                                    </button>

                                    <button className="ml-2 hover:text-blue-600"
                                            onClick={(e) => {
                                                duplicateMutation.mutate(variante.id);
                                            }}
                                            title="Duplica variante"
                                            disabled={duplicateMutation.isLoading || deleteMutation.isLoading}
                                    >
                                        <i className="bx bx-copy text-2xl"></i>
                                    </button>


                                    <button className="ml-2 hover:text-red-600"
                                            onClick={(e) => {
                                                if (window.confirm("Sei sicuro di voler eliminare questa variante?")) {
                                                    deleteMutation.mutate(variante.id);
                                                }
                                            }}
                                            title="Elimina variante"
                                            disabled={duplicateMutation.isLoading || deleteMutation.isLoading}
                                    >
                                        <i className="bx bx-trash text-2xl"></i>
                                    </button>

                                </div>
                            </div>
                        </div>
                    ))}</div>
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
