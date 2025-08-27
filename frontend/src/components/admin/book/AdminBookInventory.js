import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import EditableField from "./EditableField";
import SelectableRadioField from "./SelectableRadioField";
import React, {useEffect, useMemo, useRef, useState} from "react";
import DescriptionEditor from "../../libri/details/DescriptionEditor";
import RemovableField from "./RemovableField";
import toast from "react-hot-toast";
import MaskedSuggestionInput from "./MaskedSuggetionInput";
import CheckableField from "./CheckableField";
import ViewableField from "./ViewableField";
import ButtonField from "./ButtonField";
import {usePageTitle} from "../../utils/usePageTitle";

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

const updateRifornimento = async ({id, bookData}) => {
    const {data} = await axios.put(`/api/libri/${id}/rifornimento`, bookData);
    return data;
}


const AdminBookInventory = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 1. Nuovo stato per le modifiche non salvate
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const {data: book, isLoading: isBookLoading, error: bookError} = useQuery({
        queryKey: ['book', id],
        queryFn: () => fetchBookById(id),
    });

    const {data: bookExists, isLoading: isBookExistsLoading, error: bookExistsError} = useQuery({
        queryKey: ['bookExists', id],
        queryFn: () => fetchBookExists(id),

    });

    const [quantity, setQuantity] = useState(0);
    const [prenotati, setPrenotati] = useState(0);
    const [prenotatiList, setPrenotatiList] = useState([]);
    const [disponibili, setDisponibili] = useState(0);

    const [prezzo, setPrezzo] = useState(0);
    const [sconto, setSconto] = useState({});
    const [scontoType, setScontoType] = useState('percentage'); // 'percentage' or 'fixed'

    const [giorniConsegna, setGiorniConsegna] = useState(0);

    const [showPrenotati, setShowPrenotati] = useState(false);

    // Inizializza gli stati quando book è disponibile
    useEffect(() => {
        if (book) {
            const rifornimento = book.rifornimento || {};

            console.log(rifornimento, " <-- rifornimento");
            setQuantity(rifornimento.quantita || 0);
            setPrenotati(rifornimento.prenotati || 0);
            setDisponibili(rifornimento.disponibili || 0);

            setPrezzo(rifornimento.prezzo || 0);

            // Determina il tipo di sconto basandosi sui dati esistenti
            const scontoData = rifornimento.sconto || {};
            if (scontoData.percentuale > 0) {
                setSconto({percentuale: scontoData.percentuale});
                setScontoType('percentage');
            } else if (scontoData.valore > 0) {
                setSconto({valore: scontoData.valore});
                setScontoType('fixed');
            } else {
                setSconto({});
                setScontoType('none');
            }

            setGiorniConsegna(rifornimento.giorniConsegna || 0);

            const prenotatiMap = rifornimento.prenotatiMap || {};
            const prenotatiArray = Object.entries(prenotatiMap).map(([userId, quantity]) => ({
                userId: userId,
                quantity: quantity
            }));
            setPrenotatiList(prenotatiArray)
        }
    }, [book]);

    // Calcola il prezzo scontato basandosi sul tipo di sconto
    const calcolaPrezzoScontato = () => {
        if (scontoType === 'percentage') {
            const percentuale = sconto.percentuale || 0;
            return (prezzo - (prezzo * percentuale / 100)).toFixed(2);
        } else if (scontoType === 'fixed') {
            const valore = sconto.valore || 0;
            return Math.max(0, prezzo - valore).toFixed(2);
        } else {
            return prezzo.toFixed(2);
        }
    };

    const priceMutation = useMutation({
        mutationFn: updateRifornimento,
        onSuccess: () => {
            toast.success('Libro aggiornato con successo!');
            // 3. Resetta lo stato dopo un salvataggio riuscito

            queryClient.invalidateQueries({queryKey: ['book', id]});
        },
        onError: (error) => {
            toast.error(`Errore nell'aggiornamento del libro: ${error.response?.data?.message || error.message}`);
        },
    });

    const handleSave = () => {
        // Costruisci l'oggetto sconto nel formato richiesto
        const scontoFormatted = scontoType === 'percentage'
            ? {percentuale: sconto.percentuale || 0, valore: 0}
            : {percentuale: 0, valore: sconto.valore || 0};

        const bookData = {
            prezzo: prezzo,
            sconto: scontoFormatted,
            prenotatiMap: prenotatiList.reduce((acc, curr) => ({...acc, [curr.userId]: curr.quantity}), {})
        };

        priceMutation.mutate({id, bookData});

        // to check
        setHasUnsavedChanges(false);

        navigate("/admin/book/" + id);
    };

    // 4. Funzione helper per gestire le modifiche e impostare lo stato
    const handleFieldChange = (setterFunction) => (value) => {
        setterFunction(value);
        setHasUnsavedChanges(true);
    };

    // Gestisce il cambio di tipo di sconto
    const handleScontoTypeChange = (newType) => {
        setScontoType(newType);

        switch (newType) {
            case 'percentage':
                setSconto({percentuale: sconto.percentuale || 0});
                break;
            case 'fixed':
                setSconto({valore: sconto.valore || 0});
                break;
            case 'none':
                setSconto({});
                break;
        }

        setHasUnsavedChanges(true);
    };
    // Gestisce navigazione browser (tasti avanti/indietro)
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

    // Mantieni l'useEffect per beforeunload (per reload/chiusura tab)
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

            <div className="flex-col mt-4">

                <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4 mt-8" style={{alignItems: 'start'}}>
                    <div className="mt-8 p-4 bg-gray-50 rounded-md">
                        <h2 className="text-md font-semibold rounded-md">Stock information</h2>

                        <ViewableField key="quantity"
                                       id="quantity"
                                       label="Available Quantity"
                                       icon="book"
                                       value={quantity}
                                       description="The number of copies available in stock."
                        />

                        <ViewableField key="prenotati"
                                       id="prenotati"
                                       label="Reserved Copies"
                                       icon="bookmark"
                                       value={prenotati}
                                       description="The number of copies that are reserved by users.
                                 You can see the list of reservations in the 'Reservations' section."
                        />

                        <ViewableField key="disponibili"
                                       id="disponibili"
                                       label="Available for Sale"
                                       icon="check-circle"
                                       value={disponibili}
                                       description="The number of copies available for sale after reservations."
                        />
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded-md">
                        <h3 className="font-semibold">Prices and Discounts</h3>

                        <EditableField key="prezzo"
                                       id="prezzo"
                                       label="Price"
                                       icon="dollar"
                                       value={prezzo}
                                       onChange={(newValue) => {
                                           const newPrezzo = parseFloat(newValue);
                                           if (!isNaN(newPrezzo) && newPrezzo >= 0) {
                                               handleFieldChange(setPrezzo)(newPrezzo);
                                           } else {
                                               toast.error("Invalid price value.");
                                           }
                                       }}
                                       description="The base price of the book. You can apply discounts to this price."
                        />

                        {/* Discount Type Selector */}
                        <SelectableRadioField
                            id="discountType"
                            label="Discount Type"
                            description="Select the type of discount to apply"
                            selectedValue={scontoType}
                            orientation="horizontal"
                            options={[
                                {
                                    value: 'percentage',
                                    label: 'Percentage',
                                    action: (value) => handleScontoTypeChange(value)
                                },
                                {
                                    value: 'fixed',
                                    label: 'Fixed Amount',
                                    action: (value) => handleScontoTypeChange(value)
                                },
                                {
                                    value: 'none',
                                    label: 'No Discount',
                                    action: (value) => handleScontoTypeChange(value)
                                }
                            ]}
                            onChange={(value) => handleScontoTypeChange(value)}
                        />

                        {/* Discount Value Field */}
                        <div className="ml-6">
                            {scontoType === 'percentage' ? (
                                <EditableField key="scontoPercentuale"
                                               id="scontoPercentuale"
                                               label="Discount Percentage"
                                               icon="tag"
                                               value={sconto.percentuale || 0}
                                               onChange={(newValue) => {
                                                   const newSconto = parseFloat(newValue);
                                                   if (!isNaN(newSconto) && newSconto >= 0 && newSconto < 100) {
                                                       handleFieldChange(setSconto)({percentuale: newSconto});
                                                   } else {
                                                       toast.error("Invalid discount percentage (0-100).");
                                                   }
                                               }}
                                               description="The discount percentage applied to the base price (0-100%)."
                                />
                            )  : scontoType === 'fixed' ? (
                                <EditableField key="scontoFisso"
                                               id="scontoFisso"
                                               label="Fixed Discount Amount"
                                               icon="tag"
                                               value={sconto.valore || 0}
                                               onChange={(newValue) => {
                                                   const newSconto = parseFloat(newValue);

                                                   if (!isNaN(newSconto) && newSconto >= 0 && newSconto < prezzo) {
                                                       handleFieldChange(setSconto)({valore: newSconto});
                                                   } else {
                                                       toast.error("Invalid fixed discount amount (0 < newPrice < price).");
                                                   }
                                               }}
                                               description="The fixed amount to subtract from the base price."
                                />
                            ) : (
                                <div className="text-gray-500 italic p-2">
                                    No discount applied
                                </div>
                            )}
                        </div>

                        <ViewableField key="prezzoScontato"
                                       id="prezzoScontato"
                                       label="Discounted Price"
                                       icon="sale"
                                       value={calcolaPrezzoScontato()}
                                       description="The price after applying the discount."
                        />

                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[35%_40%] gap-4 mt-8" style={{alignItems: 'start'}}>
                    <div className="mt-8 p-4 bg-gray-50 rounded-md">
                        <h3 className="font-semibold">Reservations List</h3>

                        {prenotatiList.length === 0 && (
                            <div className="text-gray-500 mt-2">
                                No reservations found.
                            </div>
                        )}

                        {prenotatiList.length > 0 && (
                            <>
                                <div className="mt-5">
                                    {showPrenotati ? (
                                        <button
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-700  rounded p-3 transition"
                                            onClick={() => setShowPrenotati(false)}>
                                            Hide Reservations
                                        </button>
                                    ) : (
                                        <button
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-700  rounded p-3 transition"
                                            onClick={() => setShowPrenotati(true)}>
                                            Show Reservations ({prenotatiList.length})
                                        </button>
                                    )}
                                </div>


                                {showPrenotati && (

                                    prenotatiList.map((reservation, index) => (

                                        < div
                                            className={(index % 2 === 0 ? "bg-gray-200" : "bg-white") + " ml-4 rounded-md"}>

                                            <div className="mt-6 p-4">
                                                <span className="font-semibold">User ID:</span> {reservation.userId}
                                                <br/>
                                                <span
                                                    className="font-semibold">Reserved Quantity:</span> {reservation.quantity}
                                            </div>

                                            <div className="flex flex-row items-center">
                                                <ButtonField key={`decrease-${index}`}
                                                             id={`decrease-${index}`}
                                                             icon="minus-circle"
                                                             value={reservation.quantity}
                                                             actionText="Decrease"
                                                             onChange={() => {
                                                                 const updatedList = [...prenotatiList];
                                                                 if (updatedList[index].quantity > 0) {
                                                                     updatedList[index].quantity -= 1;
                                                                     setPrenotatiList(updatedList);
                                                                     setPrenotati(prenotati - 1);
                                                                     setDisponibili(disponibili + 1);
                                                                     setHasUnsavedChanges(true); // Aggiorna lo stato
                                                                 } else {
                                                                     toast.error("Cannot decrease reservation below zero.");
                                                                 }
                                                             }}
                                                />

                                                <ButtonField key={`increase-${index}`}
                                                             id={`increase-${index}`}
                                                             icon="plus-circle"
                                                             value={reservation.quantity}
                                                             actionText="Increase"
                                                             onChange={() => {
                                                                 const updatedList = [...prenotatiList];

                                                                 if (prenotati + 1 > quantity) {
                                                                     toast.error("Cannot increase reservation beyond available stock.");
                                                                     return;
                                                                 }

                                                                 updatedList[index].quantity += 1;
                                                                 setPrenotatiList(updatedList);
                                                                 setPrenotati(prenotati + 1);
                                                                 setDisponibili(disponibili - 1);
                                                                 setHasUnsavedChanges(true); // Aggiorna lo stato
                                                             }}
                                                />

                                                <ButtonField key={`remove-${index}`}
                                                             id={`remove-${index}`}
                                                             icon="trash"
                                                             value={reservation.quantity}
                                                             actionText="Remove"
                                                             onChange={() => {
                                                                 const updatedList = prenotatiList.filter((_, i) => i !== index);
                                                                 setPrenotatiList(updatedList);
                                                                 setPrenotati(prenotati - reservation.quantity);
                                                                 setDisponibili(disponibili + reservation.quantity);
                                                                 setHasUnsavedChanges(true); // Aggiorna lo stato
                                                             }}
                                                />
                                            </div>
                                        </div>

                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

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

}

export default AdminBookInventory;