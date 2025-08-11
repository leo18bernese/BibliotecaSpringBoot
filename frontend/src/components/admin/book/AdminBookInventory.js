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
    const [prezzoScontato, setPrezzoScontato] = useState(0);

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
            setPrezzoScontato(rifornimento.prezzoScontato || 0);

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
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold">Reservations List</h3>
                        <ul className="list-disc pl-5">

                            {prenotatiList.map((reservation, index) => (

                                //todo to replace with 3 buttons each, // one to decrease, one to increase, one to clear
                                <EditableField key={index}
                                               id={`reservation-${index}`}
                                               label={`Reservation ${index + 1}`}
                                               icon="user"
                                               type="number"
                                               value={reservation.quantity}
                                               description={`User ID: ${reservation.userId} - Actual quantiy: ${reservation.quantity}`}
                                               onChange={(newValue) => {
                                                   const updatedList = [...prenotatiList];
                                                   updatedList[index].userId = newValue;
                                                   setPrenotatiList(updatedList);
                                               }}
                                />
                            ))}
                        </ul>
                    </div>
                )}

            </div>
        </div>
    );

}

export default AdminBookInventory;