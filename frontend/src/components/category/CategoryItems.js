import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useQueryClient} from "@tanstack/react-query";

const fetchCategoryItems = async (categoryId) => {
    const { data } = await axios.get(`/api/categories/${categoryId}/items`);
    return data;
}

const CategoryItems = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: items, isLoading, error } = useQuery({
        queryKey: ['categoryItems', id],
        queryFn: () => fetchCategoryItems(id),
        enabled: !!id,
    } );

    if (isLoading) {
        return <h2 className="text-center">Loading category items...</h2>;
    }

    if (error) {
        return <p>Error loading items: {error.message}</p>;
    }

    if (!items || items.length === 0) {
        return <p className="text-center my-auto text-xl">There are no items in this category.</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h3 className="text-2xl font-bold mb-4">Category Items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map(item => (
                    <div key={item.id} className="border p-4 rounded shadow hover:shadow-lg transition">
                        <h4 className="text-lg font-semibold mb-2">{item.name}</h4>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <button
                            onClick={() => navigate(`/item/${item.id}`)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CategoryItems;