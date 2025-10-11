import axios from "axios";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import React from "react";

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

const CategoryForUser = ({categoryID, isParent, current}) => {
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
        <div className="container mx-auto px-4 py-8">

            <div>

                <div className="mb-4">
                    {Object.entries(category.categoryMap).map(([id, name], index) => {

                        const isLast = index === Object.entries(category.categoryMap).length - 1;

                        return <>

                            {isLast ? (
                                    <span
                                        key={id}
                                        className="text-sm text-blue-600 mr-2"
                                    >
                                        {name}
                                    </span>
                                ) :
                                (
                                    <Link
                                        key={id}
                                        className="text-sm text-blue-600 hover:text-blue-500 mr-2 underline"
                                        to={`/category/${id}/user`}
                                    >
                                        {name}
                                    </Link>
                                )
                            }

                            {!isLast && (
                                <span className="text-gray-400 mr-2">/</span>
                            )}
                        </>
                    })}
                </div>


                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2">{category.name}</h2>
                    {category.description && (
                        <p className="text-gray-600">{category.description}</p>
                    )}
                </div>

                {
                    hasSubcategories && (
                        <div className=" py-4">

                            <div className="text-lg font-semibold  mb-5  text-gray-700 inline-block pr-5 ">
                                Subcategories
                            </div>

                            <div className="grid grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-6 ml-2">
                                {subcategories.map(subcat => {
                                        const selected = subcat.id === parseFloat(current);

                                        return (
                                            <div key={subcat.id}
                                                 className={"border p-4 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer"
                                                     + (selected ? ' bg-blue-100 font-semibold' : ' bg-gray-100')}
                                                 onClick={() => navigate(`/category/${subcat.id}/user`)}>

                                                    <span
                                                        className={`text-lg mb-2 ${selected ? 'text-blue-700' : 'text-gray-500'}`}>
                                                        {subcat.name}
                                                    </span>
                                            </div>
                                        )
                                    }
                                )}
                            </div>

                        </div>
                    )
                }

                {
                    hasItems && (
                        <div className=" py-4">

                            <div className="text-lg font-semibold  mb-5  text-gray-700 inline-block pr-5 ">
                                Items
                            </div>

                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-2">
                                {items.map(item => (
                                    <div key={item.id}
                                         className={"border p-2 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer bg-gray-100"}
                                         onClick={() => navigate(`/book/${item.id}`)}>

                                                    <span
                                                        className={`text-lg mb-2 text-gray-500`}>
                                                        {item.titolo}
                                                    </span>

                                        <span className="text-sm text-gray-400 block">ID: {item.id}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div>

        </div>
    )
        ;
}

export default CategoryForUser;