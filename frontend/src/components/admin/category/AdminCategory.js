import axios from "axios";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import EditableField from "../../ui/fields/EditableField";
import React, {useEffect, useState} from "react";
import toast from "react-hot-toast";
import MaskedSuggestionInput from "../../ui/fields/MaskedSuggetionInput";
import {usePageTitle} from "../../utils/usePageTitle";
import CreateForm from "./create/CreateForm";

const fetchCategoryById = async (id) => {
    const {data} = await axios.get(`/api/admin/category/${id}`);
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
    const {data} = await axios.get('/api/admin/category/all-names');
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

            setParentId(category.parentId);
            setParentName(category.parentName);

            if (categoryList) {

                const subCats = categoryList.filter(cat => {
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
        return categoryList.filter(cat =>
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

    const prevCategoryId = category.previousId;
    const nextCategoryId = category.nextId;

    return (
        <div className="container mx-auto p-4">

            <div className="flex justify-between items-center mb-8">
                {prevCategoryId &&
                    <Link to={`/admin/category/${prevCategoryId}`}
                          className="text-blue-500 hover:underline font-semibold">
                        ← Previous Category #{prevCategoryId}
                    </Link>
                }

                {nextCategoryId &&
                    <Link to={`/admin/category/${nextCategoryId}`}
                          className="text-blue-500 hover:underline font-semibold">
                        Next Category #{nextCategoryId} →
                    </Link>
                }
            </div>


            <h1 className="text-lg font-semibold">Category Editor - #{category.id}</h1>
            <p className="text-sm text-gray-500">
                You can edit the category details, such as name and description.
            </p>

                <div className="mt-4 flex space-x-2">
                    <Link to={`/category/${id}`}
                          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          target="_blank" rel="noopener noreferrer">
                        View Category
                    </Link>
                    <Link to={`/admin/category/${id}/images`}
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Manage Images
                    </Link>
                    <CreateForm
                        endpoint={`/api/admin/category`}
                        showAddMessage={"Create Sub-category"}
                        addMessage={"Create New Sub-category"}
                        data={[
                            ['name', 'Category Name', '', 'Name is required', false, 'text'],
                            ['description', 'Category Description', '', 'Description is required', false, 'text'],
                            ['parentId', 'Parent ID', id, null, true, 'number', true]
                        ]}
                        buttonClassName="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Create Sub-category
                    </CreateForm>
                </div>

            <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Category Relationships</h2>

                <div className="pl-4">
                    <p className="text-sm text-gray-500 mb-1 ">
                        Current Parent:
                    </p>

                    {parentId ? (
                        <Link to={`/admin/category/${parentId}`} className="hover:underline pl-4">
                            {parentName} (#{parentId})
                        </Link>
                    ) : (
                        <p className="text-sm text-gray-500 pl-4">No parent category.</p>
                    )}

                    <p className="text-sm text-gray-500 mt-6 mb-1">
                        Subcategories:
                    </p>

                    {subCategories.length > 0 ? (
                        <ul className="list-disc list-inside pl-4">
                            {subCategories.map((subCat) => (
                                <li key={subCat.id}>
                                    <Link to={`/admin/category/${subCat.id}`} className="hover:underline">
                                        {subCat.name} (#{subCat.id})
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">This category has no subcategories.</p>
                    )}
                </div>
            </div>

            <div className="mt-8 pl-4">
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
                                           if (categoryList && categoryList.some(cat => cat.name === catName)) {
                                               return true;
                                           }

                                           // Altrimenti, non è valido
                                           return false;
                                       }}
                                       onChange={(newParentName) => {
                                           const matchedCategory = categoryList.find(cat => cat.name === newParentName);

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

            <div className="mt-8 pt-5 flex justify-between transition-all duration-200">
                <div>
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
                                axios.delete(`/api/admin/category/${id}`)
                                    .then(() => {
                                        toast.success('Category deleted successfully');
                                        navigate(`/admin/category/${Number(id) - 1}`);
                                    })
                                    .catch((error) => {
                                        toast.error(`Error deleting category: ${error.message}`);
                                    });
                            }
                        }}
                        className="bg-red-300 hover:bg-red-400 text-red-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                    >
                        Delete Category
                    </button>
                </div>

                <div>
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
                            if ((!name || name.length < 2) || (!description || description.length < 2)) {
                                toast.error('Please fill in all required fields (2 chars min).');
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

            <div className="mt-8 pt-5 flex justify-end">


            </div>
        </div>
    );

}

export default AdminCategory;