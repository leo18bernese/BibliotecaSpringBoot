import {Link} from "react-router-dom";
import {usePageTitle} from "../../utils/usePageTitle";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";

const fetchOrders = async () => {
    const {data} = await axios.get('/api/admin/order/light-all');
    return data;
}

const AdminOrderHome = () => {
    const {data: orders, isLoading, error} = useQuery({
        queryKey: ['adminOrders'],
        queryFn: fetchOrders,
        select: (data) => data.sort((a, b) => a.id - b.id),
    });

    usePageTitle('Admin Home - Orders');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading orders.</div>;
    }

    if(orders.length === 0) {
        return <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - Order List</h1>
            <div>Nessun ordine presente.</div>
        </div>
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - Order List</h1>
            <table className="min-w-full bg-white border text-left border-gray-200">
                <thead>
                <tr>
                    <th className="py-2 px-4 border-b border-gray-200">ID</th>
                    <th className="py-2 px-4 border-b border-gray-200">Utente</th>
                    <th className="py-2 px-4 border-b border-gray-200">Email</th>
                    <th className="py-2 px-4 border-b border-gray-200">Data Creazione</th>
                    <th className="py-2 px-4 border-b border-gray-200">Data Modifica</th>
                    <th className="py-2 px-4 border-b border-gray-200">Somma Totale</th>
                    <th className="py-2 px-4 border-b border-gray-200">Prezzo Finale</th>
                    <th className="py-2 px-4 border-b border-gray-200">Spese Spedizione</th>
                    <th className="py-2 px-4 border-b border-gray-200">Items</th>
                    <th className="py-2 px-4 border-b border-gray-200">Coupon Usato</th>
                    <th className="py-2 px-4 border-b border-gray-200">Stato</th>
                    <th className="py-2 px-4 border-b border-gray-200">Azioni</th>
                </tr>
                </thead>
                <tbody>
                {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-100">
                        <td className="py-2 px-4 border-b border-gray-200">{order.id}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{order.utente?.nome ?? '-'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{order.utente?.email ?? '-'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{order.dataCreazione ? new Date(order.dataCreazione).toLocaleString() : '-'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{order.dataModifica ? new Date(order.dataModifica).toLocaleString() : '-'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{order.sommaTotale?.toFixed(2) ?? '-'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{order.prezzoFinale?.toFixed(2) ?? '-'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{order.speseSpedizione?.toFixed(2) ?? '-'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{order.items}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{order.couponUsed ? 'Sì' : 'No'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{order.stato ?? '-'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">
                            <Link
                                to={`/admin/order/${order.id}`}
                                className="text-blue-500 hover:underline"
                            >
                                Gestisci Ordine
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminOrderHome;