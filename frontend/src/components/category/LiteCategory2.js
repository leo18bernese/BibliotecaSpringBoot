import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";
import React, {useContext} from "react";
import {UserContext} from "../user/UserContext";

const fetchCategoryById = async (categoryId) => {
    const {data} = await axios.get(`/api/categories/${categoryId}`);
    return data;
}

const fetchImageById = async (categoryId) => {
    const {data} = await axios.get(`/api/categories/${categoryId}/image`);
    return data;
}


const LiteCategory2 = ({categoryID, category: providedCategory}) => {
    const {user, isAdmin, isAdminMode} = useContext(UserContext);
    const navigate = useNavigate();
    const categoryId = categoryID || (providedCategory?.id);

    const {data: category, isLoading, error} = useQuery({
        queryKey: ['liteCategory', categoryId],
        queryFn: () => fetchCategoryById(categoryId),
        enabled: !providedCategory && !!categoryId,
    });

    const {data: imageData} = useQuery({
        queryKey: ['categoryImage', categoryId],
        queryFn: () => fetchImageById(categoryId),
        enabled: !!categoryId,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading category details.</div>;
    }

    return (
        <>
            <div className="bg-white border border-gray-600 cursor-pointer hover:shadow-2xl text-center"
                 onClick={() => navigate(`/category/${categoryId}`)}
            >

                <div className="relative">
                    <img src={`/api/categories/${categoryId}/image`}
                         className="w-full h-48 object-cover mb-4 "
                         alt={category.name}
                    />

                    {user && isAdminMode() && (
                        <>
                        <Link to={`/admin/category/${categoryID}`} target={`_blank`}>
                            <div
                                className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md font-semibold
                                        hover:bg-yellow-600 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <i className='bx bx-edit-alt text-xl'></i>
                            </div>
                        </Link>

                            <Link to={`/admin/category/${categoryID}/images`} target={`_blank`}>
                                <div
                                    className="absolute bottom-2 left-12 bg-yellow-500 text-white px-2 py-1 rounded-md font-semibold
                                        hover:bg-yellow-600 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <i className='bx bx-image text-xl'></i>
                                </div>
                            </Link>

                        </>
                    )}
                </div>

                <div className="text-center text-gray-700 ">
                    <h3 className="font-bold  my-5">{category.name}</h3>
                </div>
            </div>
        </>
    );
}

export default LiteCategory2;