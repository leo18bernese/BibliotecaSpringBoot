import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import CategoryMap from "./CategoryMap";
import LiteCategory2 from "./LiteCategory2";
import CategorySearchPage from "../libri/search/CategorySearchPage";
import {useContext} from "react";
import {UserContext} from "../user/UserContext";

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

const CategoryItemsFinal = ({categoryID, isParent, current}) => {
    const {user, isAdmin} = useContext(UserContext);
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

    const hasSubcategories = (subcategories && subcategories.length > 0);
    const hasItems = (items && items.length > 0);
    const hasSomething = hasSubcategories || hasItems;

    return (
        <div className={`container mx-auto py-8 ${isParent ? '' : 'px-4'}`}>

            <div>

                <CategoryMap map={category.categoryMap} considerLast={false} backToCategories={!category.parentId}/>

                {categoryID ? (
                    <div className="text-2xl font-semibold cursor-pointer mb-4 flex flex-row items-center">
                        <i className='bxr bxs-folder text-blue-700'></i>

                        <span
                            className="ml-2 text-gray-800 hover:text-blue-700"
                            onClick={() => navigate('/category/' + id)}
                        >
                            {category ? category.name : 'Category'}
                        </span>
                    </div>
                ) : (
                    <div className="mb-6">

                        <div className="flex items-center mb-2 space-x-4">
                            <h2 className="text-3xl font-bold mb-2">{category.name}</h2>

                            {(user && isAdmin()) && (
                                <>
                                    <i className='bxr bx-edit text-2xl cursor-pointer'
                                       onClick={() => navigate('/admin/category/' + id)}
                                    ></i>

                                    <i className='bxr bx-image text-2xl cursor-pointer'
                                       onClick={() => navigate('/admin/category/' + id + '/images')}
                                    ></i>
                                </>
                            )}
                        </div>

                        {category.description && (
                            <p className="text-gray-600">{category.description}</p>
                        )}
                    </div>
                )}

                <div className="py-4">

                    {hasSubcategories && (
                        <div className=" py-4">

                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3 md:gap-6 ml-2">
                                {subcategories.map(subcat => {

                                        return (
                                            <LiteCategory2 categoryID={subcat.id} key={subcat.id}/>
                                        )
                                    }
                                )}
                            </div>
                        </div>
                    )}

                    {!subcategories && (
                        <CategorySearchPage categoryId={id} hideCategoryTitle={true}/>
                    )}

                </div>


            </div>

        </div>
    );
}

export default CategoryItemsFinal;