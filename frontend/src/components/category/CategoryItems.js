import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useQueryClient} from "@tanstack/react-query";

const fetchCategoryById = async (categoryId) => {
    const {data} = await axios.get(`/api/categories/${categoryId}`);
    return data;
}

const fetchSubcategories = async (categoryId) => {
    const {data} = await axios.get(`/api/categories/${categoryId}/subcategories`);
    return data;
}

const fetchCategoryItems = async (categoryId) => {
    const {data} = await axios.get(`/api/categories/${categoryId}/items`);
    return data;
}

const CategoryItems = ({categoryID, isParent}) => {
    const {catId} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const id = categoryID || catId;

    const {data: category, isLoading: isCategoryLoading, error: categoryError} = useQuery({
        queryKey: ['liteCategory', id],
        queryFn: () => fetchCategoryById(id),
        enabled: !!id,
    });

    const {data: subcategories} = useQuery({
        queryKey: ['subcategories', id],
        queryFn: () => fetchSubcategories(id),
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

    if ((!items || items.length === 0) && (!subcategories || subcategories.length === 0) && !category.parent) {
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
        <div className="container mx-auto py-4">

            <div>

                <div
                    className={`text-blue-600 underline text-2xl font-bold mb-6 ${!categoryID ? 'cursor-default' : 'cursor-pointer hover:text-blue-700'}`}
                    onClick={() => navigate('/category/' + id)}
                >
                    {categoryID ? 'Parent: ' : ''} {category ? category.name : 'Category'}
                </div>


                {items.length > 0 ? (

                    isParent ? (
                        <div className="mb-6">
                            <p>Click on category name to see items</p>
                        </div>
                    ) : (

                        <>
                            <div className="text-lg font-bold mb-4 border-b-2 border-gray-600 inline-block pr-5 ">
                                Category Items
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-2">
                                {items.map(item => (
                                    <div key={item.id}
                                         className="border p-4 rounded shadow hover:bg-gray-200 transition cursor-pointer"
                                         onClick={() => navigate(`/book/${item.id}`)}
                                    >
                                        <h4 className="text-lg font-semibold mb-2">{item.titolo}</h4>
                                    </div>
                                ))}
                            </div>
                        </>
                    )
                ) : (
                    !isParent && (

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold">No items found</h3>
                            <p>Unfortunately, there are no items available in this category. You can explore subcategories
                                or parent categories for more options.</p>
                        </div>
                    )
                )}

                {subcategories.length > 0 && (
                    <div className="mt-10 py-4 border-t">

                        <div className="text-lg font-bold mb-4 border-b-2 border-gray-600 inline-block pr-5 ">
                            Sub Categories
                        </div>

                        <div className="mt-4 grid grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-6 ml-2">
                            {subcategories.map(subcat => (
                                <div key={subcat.id}
                                     className={"border p-4 rounded shadow hover:shadow-lg transition cursor-pointer"
                                         + (subcat.id === parseFloat(catId) ? ' bg-gray-300' : ' bg-white')}
                                     onClick={() => navigate(`/category/${subcat.id}`)}>
                                    <h4 className="text-lg font-semibold mb-2">{subcat.name}</h4>

                                    {(subcat.id === parseFloat(catId)) && (
                                        <div className="mt-2 text-sm text-blue-600 font-bold">
                                            SELECTED
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                    </div>
                )}

                {category.parent && (
                    <div className="mt-10 py-4 pl-6 border-t">
                        <CategoryItems categoryID={category.parent.id} isParent={true}/>
                    </div>
                )}


            </div>

        </div>
    );
}

export default CategoryItems;