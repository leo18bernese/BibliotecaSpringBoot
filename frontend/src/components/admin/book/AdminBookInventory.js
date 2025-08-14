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
import ViewableField from "./ViewableField";
import ButtonField from "./ButtonField";

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

const fetchAutoriList = async () => {
    const {data} = await axios.get('/api/autori');
    return data;
}

const updateBook = async ({id, bookData}) => {
    const {data} = await axios.put(`/api/libri/${id}`, bookData);
    return data;
}


const AdminBookInventory = () => {
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

    const [quantity, setQuantity] = useState(0);
    const [prenotati, setPrenotati] = useState(0);
    const [prenotatiList, setPrenotatiList] = useState([]);
    const [disponibili, setDisponibili] = useState(0);

    const [prezzo, setPrezzo] = useState(0);
    const [sconto, setSconto] = useState({});

    const [giorniConsegna, setGiorniConsegna] = useState(0);

    // Inizializza gli stati quando book è disponibile
    useEffect(() => {
        if (book) {
            const rifornimento = book.rifornimento || {};

            console.log(rifornimento.prenotatiMap || []);
            setQuantity(rifornimento.quantita || 0);
            setPrenotati(rifornimento.prenotati || 0);
            setDisponibili(rifornimento.disponibili || 0);

            setPrezzo(rifornimento.prezzo || 0);
            setSconto(rifornimento.sconto || {});

            setGiorniConsegna(rifornimento.giorniConsegna || 0);

            const prenotatiMap = rifornimento.prenotatiMap || {};
            const prenotatiArray = Object.entries(prenotatiMap).map(([userId, quantity]) => ({
                userId: userId,
                quantity: quantity
            }));
            setPrenotatiList(prenotatiArray)

        }
    }, [book]);

    const mutation = useMutation({
        mutationFn: updateBook,
        onSuccess: () => {
            toast.success('Libro aggiornato con successo!');

            navigate("/admin/book/" + id);

            queryClient.invalidateQueries({queryKey: ['book', id]});
        },
        onError: (error) => {
            toast.error(`Errore nell'aggiornamento del libro: ${error.response?.data?.message || error.message}`);
        },
    });

    const handleSave = () => {
        // const currentDescription = getEditorContent(); // Se si usa l'editor, altrimenti lo stato 'description'
        const bookData = {};

        mutation.mutate({id, bookData});
    };


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

            <div className="mt-8 p-4">
                <h2 className="text-md font-semibold">Stock information</h2>

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

                {prenotatiList.length > 0 && (

                    <div className="mt-12">
                        <h3 className="font-semibold">Reservations List</h3>

                        {prenotatiList.map((reservation, index) => (

                            < div className={(index % 2 === 0 ? "bg-gray-300" : "bg-white") + " ml-4"}>
                                <div className="mt-6 p-4">
                                    <span className="font-semibold">User ID:</span> {reservation.userId} <br/>
                                    <span className="font-semibold">Reserved Quantity:</span> {reservation.quantity}
                                </div>

                                <div className="flex flex-row items-center gap-6 pb-4">
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
                                                 }}
                                    />
                                </div>
                            </div>

                        ))}
                    </div>
                )}

                <div className="mt-12">
                    <h3 className="font-semibold">Prices and Discounts</h3>

                    <EditableField key="prezzo"
                                      id="prezzo"
                                        label="Price"
                                        icon="dollar"
                                        value={prezzo}
                                        onChange={(newValue) => {
                                            const newPrezzo = parseFloat(newValue);

                                            if (!isNaN(newPrezzo) && newPrezzo >= 0) {
                                                setPrezzo(newPrezzo);
                                            } else {
                                                toast.error("Invalid price value.");
                                            }
                                        }}
                                        description="The base price of the book. You can apply discounts to this price."
                    />

                    <EditableField key="sconto"
                                      id="sconto"
                                        label="Discount Percentage"
                                        icon="tag"
                                        value={sconto.percentuale || 0}
                                        onChange={(newValue) => {
                                            const newSconto = parseFloat(newValue);

                                            if (!isNaN(newSconto) && newSconto >= 0 && newSconto <= 100) {
                                                setSconto({percentuale: newSconto});
                                            } else {
                                                toast.error("Invalid discount percentage.");
                                            }
                                        }}
                                        description="The discount percentage applied to the base price."
                    />

                    <ViewableField key="prezzoScontato"
                                   id="prezzoScontato"
                                   label="Discounted Price"
                                   icon="sale"
                                   value={(prezzo - (prezzo * (sconto.percentuale || 0) / 100)).toFixed(2)}
                                   description="The price after applying the discount."
                    />

                </div>

            </div>
        </div>
    );

}

export default AdminBookInventory;