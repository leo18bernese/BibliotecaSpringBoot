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


const LiteCategory = ({categoryID, category: providedCategory}) => {

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

    console.log("Rendering LiteCategory with category:", category || providedCategory);

    return (
        <>
            <div className="bg-white shadow-lg rounded-lg flex flex-col h-full">
                <div
                    className={`flex flex-col flex-grow text-center relative overflow-hidden cursor-pointer
                     rounded-md transition-shadow duration-300
                      ${!imageData ? '  hover:shadow-xl' : 'hover:shadow-2xl'}`}
                    style={imageData ? {
                        backgroundImage: `url(/api/categories/${categoryId}/image)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '12rem',
                        justifyContent: 'center',
                    } : {
                        backgroundImage: 'linear-gradient(135deg, #e0e0e0 10%, #bdbdbd 100%)',
                        justifyContent: 'center',
                    }
                    }

                    onClick={() => navigate(`/category/${categoryId}`)}
                >
                    {imageData && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'rgba(0,0,0,0.55)',
                                zIndex: 1,
                                borderRadius: '0.5rem',
                            }}
                        />
                    )}
                    <div style={{position: 'relative', zIndex: 2, padding: '1rem', width: '100%'}}>
                        <h3 className="font-bold text-xl mb-5"
                            style={{color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>{category.name}</h3>
                        <p style={{color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>{category.description}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LiteCategory;