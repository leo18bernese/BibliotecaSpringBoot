import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import React, {useState} from "react";
import {usePageTitle} from "../../utils/usePageTitle";
import ButtonField from "../../ui/fields/ButtonField";
import BookChart from "./chart/BookChart";
import ImpressionChart from "./chart/ImpressionChart";
import AnalyticsOverview from "./chart/Analytics";
import MinImpressionChart from "./chart/periods/MinImpressionChart";
import DailyImpressionChart from "./chart/periods/DailyImpressionChart";
import HourlyImpressionChart from "./chart/periods/HourlyImpressionChart";

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

const getButtonClass = (text, color, hoverColor, icon, action) => {
    return <button
        className={`p-2 text-white font-semibold rounded-md transition-colors ${color} hover:${hoverColor} ml-2 mb-4`}
        onClick={action}
    >
        <div className="flex items-center gap-2">
            <i className={`bxr ${icon} text-xl`}></i>
            {text}
        </div>
    </button>
}

const AdminBookOverview = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [selectedChart, setSelectedChart] = useState("20min" );

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

    usePageTitle('Book #' + id + ' - Overview');

    if (isBookLoading || isBookExistsLoading || areImagesLoading) {
        return <div>Loading...</div>;
    }

    if (bookError || bookExistsError) {
        return <div>Error loading book data.</div>;
    }

    if (!book || !bookExists) {
        return <div className="p-4">Book not found or does not exist.</div>;
    }

    return (
        <div className="container mx-auto p-4 ">
            <div className="flex  justify-between">
                <div>
                    <h1 className="text-lg font-semibold">Manage Book #{id}</h1>
                    <p className="text-sm text-gray-500">
                        Choose what you want to edit for this book. <br/>
                        You're able to edit the book details or manage other aspects like inventory and suppliers.
                    </p>

                    <div>
                        <ul className="list-none list-inside text-lg">
                            <li><strong>Title:</strong> {book.titolo}</li>
                            <li><strong>Author:</strong> {book.autore?.nome}</li>
                            <li><strong>ISBN:</strong> {book.isbn}</li>
                        </ul>
                    </div>

                    <div className="mt-8">

                        {getButtonClass("Edit Book Details", "bg-blue-400", "bg-blue-500", "bxs-pencil",
                            () => navigate(`/admin/book/${id}/edit`))}

                        {getButtonClass("Manage Images", "bg-yellow-500", "bg-yellow-600", "bxs-image",
                            () => navigate(`/admin/book/${id}/images`))}

                        {getButtonClass("Manage Inventory and Suppliers", "bg-green-500", "bg-green-600", "bxs-shopping-bag-alt",
                            () => navigate(`/admin/book/${id}/inventory`))}

                        <br/>
                        <hr className="my-4" style={{borderTop: '2px solid #ccc'}}/>
                        {getButtonClass("Delete Book", "bg-red-500", "bg-red-600", "bxs-trash",
                            () => navigate(`/admin/book/${id}/delete`))}

                    </div>

                    <div className="mt-8">

                        <h2 className="text-xl font-semibold mb-4">Book Analytics</h2>

                        <select value={selectedChart} onChange={(e) => setSelectedChart(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md">
                            <option value="20min">20 Minutes interval (up to 3 days)</option>
                            <option value="hourly">Hour interval (up to 14 days)</option>
                            <option value="daily">Daily interval</option>
                        </select>

                        <div className="mt-4">
                            {selectedChart === "20min" && <MinImpressionChart productId={id} />}
                            {selectedChart === "hourly" && <HourlyImpressionChart productId={id} />}
                            {selectedChart === "daily" && <DailyImpressionChart productId={id} />}
                        </div>
                    </div>

                </div>


                <div>
                    <button
                        className="p-3 bg-gray-400 text-gray-100 font-semibold rounded-md hover:bg-gray-500 transition"
                        onClick={() => window.open(`/book/${id}`, '_blank')}
                    >
                        View Book Page ->
                    </button>

                </div>
            </div>
        </div>
    );

}

export default AdminBookOverview;