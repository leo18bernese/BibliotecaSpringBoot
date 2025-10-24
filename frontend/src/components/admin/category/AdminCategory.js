import axios from "axios";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import EditableField from "../../ui/fields/EditableField";
import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import MaskedSuggestionInput from "../../ui/fields/MaskedSuggetionInput";
import {usePageTitle} from "../../utils/usePageTitle";

const fetchCategoryById = async (id) => {
    const {data} = await axios.get(`/api/categories/${id}`);
    console.log("fetched category data:", data);
    return data;
};

const fetchCategoryExists = async (id) => {
    if (!id || id <= 0) return false;
    const {data} = await axios.get(`/api/categories/${id}/exists`);
    return data;
}

const updateCategory = async ({id, categoryData}) => {
    const {data} = await axios.patch(`/api/admin/category/${id}`, categoryData);
    return data;
}

const fetchCategoryList = async () => {
    const {data} = await axios.get('/api/admin/category/light-all');
    return data;
}

const AdminCategory = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();


    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const [parentId, setParentId] = useState(null);
    const [parentName, setParentName] = useState('');


    const {data: category, isLoading: isCategoryLoading, error: categoryError} = useQuery({
        queryKey: ['category', id],
        queryFn: () => fetchCategoryById(id),
    });

    const {data: categoryExists, isLoading: isCategoryExistsLoading, error: categoryExistsError} = useQuery({
        queryKey: ['categoryExists', id],
        queryFn: () => fetchCategoryExists(id),

    });

    const {data: categoryList} = useQuery({
        queryKey: ['allCategories'],
        queryFn: fetchCategoryList,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const [subCategories, setSubCategories] = useState([]);

    // Inizializza gli stati quando category è disponibile
    useEffect(() => {
        if (category) {
            setName(category.name || '');
            setDescription(category.description || '');

            setParentId(category.parent ? category.parent.id : null);
            setParentName(category.parent ? category.parent.name : '');

            if (categoryList) {

                const subCats = categoryList.content.filter(cat => {
                    return cat.parentId === category.id
                });

                setSubCategories(subCats);
            }

        }

    }, [category, categoryList]);


    /* const {data: images, isLoading: areImagesLoading} = useQuery({
         queryKey: ['images', id],
     });*/

    const mutation = useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            toast.success('Category updated successfully');

            navigate("/admin/category/" + id);

            queryClient.invalidateQueries({queryKey: ['category', id]});
        },
        onError: (error) => {
            toast.error(`Errore nell'aggiornamento della categoria: ${error.message}`);
        },
    });

    const handleSave = () => {
        // const currentDescription = getEditorContent(); // Se si usa l'editor, altrimenti lo stato 'description'
        const categoryData = {
            name: name,
            description: description,
            parentId: parentId || null,
        };

        mutation.mutate({id, categoryData});
    };


    const getParentSuggestions = (query) => {
        if (!categoryList || query.length < 2) {
            return [];
        }
        return categoryList.content.filter(cat =>
            cat.name.toLowerCase().includes(query.toLowerCase()) && (cat.id !== Number(id))
        ).map(cat => ({
            label: `${cat.name} (#${cat.id})`,
            value: cat.name
        }));
    };

    usePageTitle('Category #' + id + ' - Editor');

    if (isCategoryLoading || isCategoryExistsLoading /*|| areImagesLoading*/) {
        return <div>Loading...</div>;
    }

    if (categoryError || categoryExistsError) {
        return <div>Error loading category data.</div>;
    }

    if (!category || !categoryExists) {
        return <div className="p-4">Category not found or does not exist.</div>;
    }


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-lg font-semibold">Category Editor</h1>
            <p className="text-sm text-gray-500">
                You can edit the category details, such as name and description.
            </p>

            <div className="mt-8 p-4">
                <h2 className="text-md font-semibold">Parent of categories</h2>

                <p className="text-sm text-gray-500">
                    Current Parent
                    Category: {category.parent ? `${category.parent.name} (#${category.parent.id})` : 'None'}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                    Subcategories:
                </p>

                {subCategories.length > 0 ? (
                    <ul className="list-disc list-inside">
                        {subCategories.map((subCat) => (
                            <li key={subCat.id}>
                                <Link to={`/admin/category/${subCat.id}`} className="hover:underline">
                                {subCat.name} (#{subCat.id})
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No subcategories.</p>
                )}
            </div>

            <div className="mt-8 p-4">
                <h2 className="text-md font-semibold">Category Details</h2>

                <EditableField key={`name-${category?.id || 'new'}`}
                               id="name"
                               label="Name" icon="category"
                               value={name}
                               placeholder="Enter category name"
                               minChars={2} maxChars={128}
                               onChange={(newName) => {
                                   setName(newName);
                               }}
                />

                <EditableField key={`description-${category?.id || 'new'}`}
                               id="description"
                               label="Description" icon="description"
                               value={description}
                               placeholder="Enter category description"
                               minChars={0} maxChars={512}
                               type="textarea"
                               onChange={(newDescription) => {
                                   setDescription(newDescription);
                               }}
                />

                <MaskedSuggestionInput key={`parent-${category?.id || 'new'}`}
                                       id="parent" label="Parent Category" icon="sitemap"
                                       value={parentName}
                                       placeholder="Search or enter parent category"
                                       minChars={1} maxChars={30}
                                       fetchSuggestions={getParentSuggestions}
                                       requirement={(catName) => {
                                           if (!catName) return true; // Campo vuoto è valido (nessun genitore)

                                           // Se il nome corrisponde a una categoria esistente, è valido
                                           if (categoryList && categoryList.content.some(cat => cat.name === catName)) {
                                               return true;
                                           }

                                           // Altrimenti, non è valido
                                           return false;
                                       }}
                                       onChange={(newParentName) => {
                                           const matchedCategory = categoryList.content.find(cat => cat.name === newParentName);

                                           if (matchedCategory) {
                                               setParentId(matchedCategory.id);
                                               setParentName(matchedCategory.name);
                                           } else {
                                               setParentId(null);
                                               setParentName(newParentName);
                                           }
                                       }}
                />
            </div>

            <div className="mt-8 pt-5 flex justify-end">

                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to discard changes?")) {
                            navigate("/admin/category/" + id);
                        }
                    }}
                    className="bg-red-300 hover:bg-red-400 text-red-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                >
                    Discard Changes
                </button>

                <button
                    onClick={() => {
                        if (!name || name.length < 2 || !description || description.length < 2) {
                            toast.error('Please fill in all required fields.');
                            return;
                        }

                        if (window.confirm("Are you sure you want to save changes?")) {
                            handleSave();
                        }
                    }}
                    disabled={mutation.isPending}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                >
                    {mutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

}

export default AdminCategory;