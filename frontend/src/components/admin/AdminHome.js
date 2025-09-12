import {Link, NavLink} from "react-router-dom";
import {usePageTitle} from "../utils/usePageTitle";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";

const fetchBooks = async () => {
    const {data} = await axios.get('/api/admin/libri/light-all');
    return data;
}

const AdminHome = () => {
    const {data: books, isLoading, error} = useQuery({
        queryKey: ['adminBooks'],
        queryFn: fetchBooks,
        select: (data) => data.sort((a, b) => a.id - b.id), // Ordina i libri per ID in ordine crescente
    });

    usePageTitle('Admin Dashboard');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading books.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h3 className="text-2xl font-bold mb-4">Dashboard</h3>

            <NavLink to="/admin/book" className="inline-block mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                <i className="bxr bxs-book mr-2"></i> Book List
            </NavLink>
        </div>
    );
}

export default AdminHome;