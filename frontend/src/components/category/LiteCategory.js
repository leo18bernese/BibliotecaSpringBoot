import {useQuery} from "@tanstack/react-query";
import axios from "axios";

const fetchCategoryById = async (categoryId) => {
    const {data} = await axios.get(`/api/categories/${categoryId}`);
    return data;
}

const LiteCategory = ({categoryID, category: providedCategory}) => {

    const categoryId =  categoryID || (providedCategory?.id);

    const {data: category, isLoading, error} = useQuery({
        queryKey: ['liteCategory', categoryId],
        queryFn: () => fetchCategoryById(categoryId),
        enabled: !providedCategory && !!categoryId,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading category details.</div>;
    }

    console.log("Rendering LiteCategory with category:", category || providedCategory);

    return (
        <>
            <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col h-full">
                <div className="flex flex-col flex-grow text-center">

                    <h3 className="font-bold text-xl mb-5">{category.name}</h3>
                    <p>{category.description}</p>
                </div>
            </div>
        </>
    );
}

export default LiteCategory;