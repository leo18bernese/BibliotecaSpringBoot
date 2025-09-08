import {Link} from "react-router-dom";
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

    usePageTitle('Admin Home');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading books.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - Book List</h1>
            <table className="min-w-full bg-white border text-left border-gray-200">

                <thead>
                <tr>
                    <th className="py-2 px-4 border-b border-gray-200">ID</th>
                    <th className="py-2 px-4 border-b border-gray-200">Title</th>
                    <th className="py-2 px-4 border-b border-gray-200">Author</th>
                    <th className="py-2 px-4 border-b border-gray-200">Isbn</th>
                    <th className="py-2 px-4 border-b border-gray-200">Variants</th>
                    <th className="py-2 px-4 border-b border-gray-200">Actions</th>
                </tr>
                </thead>

                <tbody>
                {books.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-100">
                        <td className="py-2 px-4 border-b border-gray-200">{book.id}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{book.name}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{book.author}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{book.isbn}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{book.variants}</td>

                        <td className="py-2 px-4 border-b border-gray-200">
                            <Link
                                to={`/admin/book/${book.id}`}
                                className="text-blue-500 hover:underline"
                            >
                                Manage Inventory
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminHome;