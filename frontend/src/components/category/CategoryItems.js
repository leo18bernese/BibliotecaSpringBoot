import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useQueryClient} from "@tanstack/react-query";

const fetchCategoryById = async (categoryId) => {
    const {data} = await axios.get(`/api/categories/${categoryId}`);
    return data;
}

const fetchCategoryItems = async (categoryId) => {
    const {data} = await axios.get(`/api/categories/${categoryId}/items`);
    return data;
}

const CategoryItems = ({categoryID}) => {
    const {catId} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const id = categoryID || catId;

    const {data: category, isLoading: isCategoryLoading, error: categoryError} = useQuery({
        queryKey: ['liteCategory', id],
        queryFn: () => fetchCategoryById(id),
        enabled: !!id,
    });

    const {data: items, isLoading, error} = useQuery({
        queryKey: ['categoryItems', id],
        queryFn: () => fetchCategoryItems(id),
        enabled: !!id,
    });

    if (isLoading || isCategoryLoading) {
        return <h2 className="text-center">Loading category items...</h2>;
    }

    if (error || categoryError) {
        return <p>Error loading items: {error.message || categoryError.message}</p>;
    }

    if (!items || items.length === 0) {
        return <div className="text-center my-auto ">
            <p className="text-2xl font-semibold">We couldn't find any items in this category.</p>
            <p className="text-gray-600">Please check back later or explore other categories.</p>

            <button
                onClick={() => navigate('/categories')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            > Browse Categories
            </button>

        </div>;
    }

    return (
        <div className="container mx-auto p-4">

                <span className="text-gray-700 text-2xl font-bold mb-6">
                    {categoryID ? 'Parent Category: ' : ''} {category ? category.name : 'Category'}
                </span>

         <p className="text-gray-700 text-2xl font-bold mb-6"></p>

            <h3 className="text-lg font-bold mb-4 border-b-2 border-gray-600 inline-block pr-5 ">Category Items</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map(item => (
                    <div key={item.id} className="border p-4 rounded shadow hover:shadow-lg transition">
                        <h4 className="text-lg font-semibold mb-2">{item.titolo}</h4>

                        <button
                            onClick={() => navigate(`/book/${item.id}`)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>

            {category.parent && (
                <div className="mt-10 p-4 border-t">
                <CategoryItems categoryID={category.parent.id}/>
                </div>
            )}

        </div>
    );
}

export default CategoryItems;