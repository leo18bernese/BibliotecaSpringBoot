import {Link} from "react-router-dom";
import {usePageTitle} from "../../utils/usePageTitle";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";

const fetchResi = async () => {
    const {data} = await axios.get('/api/admin/resi/light-all');
    return data;
}

const AdminResoHome = () => {
    const {data: resi, isLoading, error} = useQuery({
        queryKey: ['adminResoLight'],
        queryFn: fetchResi,
        select: (data) => data.sort((a, b) => a.id - b.id),
    });

    usePageTitle('Admin Home - Resi');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading resi.</div>;
    }

    if (resi.length === 0) {
        return <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - Resi List</h1>
            <div>Nessun reso presente.</div>
        </div>
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - Resi List</h1>
            <table className="min-w-full bg-white border text-left border-gray-200">
                <thead>
                <tr>
                    <th className="py-2 px-4 border-b border-gray-200">ID Reso</th>
                    <th className="py-2 px-4 border-b border-gray-200">ID Ordine</th>
                    <th className="py-2 px-4 border-b border-gray-200">Numero Articoli</th>
                    <th className="py-2 px-4 border-b border-gray-200">Stato</th>
                    <th className="py-2 px-4 border-b border-gray-200">Azioni</th>
                </tr>
                </thead>
                <tbody>
                {resi.map((reso) => (
                    <tr key={reso.id} className="hover:bg-gray-100">
                        <td className="py-2 px-4 border-b border-gray-200">{reso.id}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{reso.ordineId}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{reso.itemsCount}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{reso.statoCorrente ?? '-'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">
                            <Link
                                to={`/admin/reso/${reso.id}`}
                                className="text-blue-500 hover:underline"
                            >
                                Gestisci Reso
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminResoHome;