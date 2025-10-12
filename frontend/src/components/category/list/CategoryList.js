import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import {Link} from "react-router-dom";

const fetchRootCategories = async () => {
    const {data} = await axios.get('/api/categories/roots');
    return data;
}

const CategoryList = () => {

    const {data: categories, isLoading, error} = useQuery({
        queryKey: ['rootCategories'],
        queryFn: fetchRootCategories,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading categories.</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">

            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Category List</h2>
                    <p className="text-gray-600">Explore our wide range of categories and subcategories to find exactly what you're looking for.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">

                {categories && categories.map(category => (
                    <div key={category.id} className="bg-white shadow-lg rounded-lg flex flex-col h-full p-4">

                        <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                        <p className="text-gray-600">{category.descrizione}</p>

                        <ul className="mt-4 list-disc list-inside text-lg">
                            {category.subcategories && category.subcategories.map(subcat => (

                                <li>
                                    <Link to={`/category/${subcat.id}`} key={subcat.id}
                                          className="text-gray-700 hover:underline">
                                        {subcat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CategoryList;