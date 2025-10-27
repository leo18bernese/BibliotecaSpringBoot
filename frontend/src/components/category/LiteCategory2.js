import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const fetchCategoryById = async (categoryId) => {
    const {data} = await axios.get(`/api/categories/${categoryId}`);
    return data;
}

const fetchImageById = async (categoryId) => {
    const {data} = await axios.get(`/api/categories/${categoryId}/image`);
    return data;
}


const LiteCategory2 = ({categoryID, category: providedCategory}) => {

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

                <img src={`/api/categories/${categoryId}/image`}
                    className="w-full h-48 object-cover "
                    alt={category.name}
                />

                <div className="text-center text-gray-700 ">
                    <h3 className="font-bold  my-5">{category.name}</h3>
                </div>
            </div>
        </>
    );
}

export default LiteCategory2;