import {useNavigate} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {useRef, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import CategoryForm from "./CategoryForm";

const CreateCategory = ({showAddCategoryPopup, setShowAddCategoryPopup}) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [newData, setNewData] = useState({
        nome: '',
        descrizione: '',
        parentId: null,
    });
    const [cateogoryErrors, setCategoryErrors] = useState({});
    const cateogoryErrorRef = useRef(null);

    const handleNewCategoryChange = (e) => {
        const {name, value} = e.target;

        setNewData(prev => ({...prev, [name]: value}));

        if (cateogoryErrors[name]) {
            setCategoryErrors(prev => ({...prev, [name]: null}));
        }
    };

    const handleAddCategory = async () => {
        // Validazione base
        const errors = {};
        if (!newData.nome) errors.nome = "Nome obbligatorio";
        if (!newData.descrizione) errors.descrizione = "Descrizione obbligatoria";

        if (Object.keys(errors).length > 0) {
            setCategoryErrors(errors);
            return;
        }

        try {
            await axios.post(`/api/categories/new`, {
                nome: newData.nome,
                descrizione: newData.descrizione,
                parentId: newData.parentId || null,
            });
            toast.success("Categoria aggiunta con successo!");
            setShowAddCategoryPopup(false);

            setNewData({
                nome: '',
                descrizione: '',
                parentId: null,
            });

            setCategoryErrors({});
        } catch (err) {
            toast.error("Errore nell'aggiunta categoria");
        }
    };


    return <>
        {showAddCategoryPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Aggiungi Nuova Categoria</h3>
                        <button
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                            onClick={() => {
                                setShowAddCategoryPopup(false);
                                setNewData({
                                    nome: '',
                                    descrizione: '',
                                    parentId: null,
                                });
                                setCategoryErrors({});
                            }}
                        >
                            ×
                        </button>
                    </div>


                    <CategoryForm
                        categoryData={newData}
                        handleChange={handleNewCategoryChange}
                        errors={cateogoryErrors}
                        errorRef={cateogoryErrorRef}
                    />

                    <div className="flex gap-3 mt-6">
                        <button
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded transition-colors"
                            onClick={() => {
                                setShowAddCategoryPopup(false);
                                setNewData({
                                    nome: '',
                                    descrizione: '',
                                    parentId: null,
                                });
                                setCategoryErrors({});
                            }}
                        >
                            Annulla
                        </button>
                        <button
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                            onClick={handleAddCategory}
                        >
                            Aggiungi Categoria
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
}

export default CreateCategory;