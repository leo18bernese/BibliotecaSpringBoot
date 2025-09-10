import {useNavigate} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {useRef, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import VariantForm from "./VariantForm";

const CreateVariant = ({bookId, showAddVariantPopup, setShowAddVariantPopup}) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [newVariant, setNewVariant] = useState({
        nome: '',
        dimensioni: {length: '', width: '', height: '', weight: ''},
        prezzo: '',
    });
    const [variantErrors, setVariantErrors] = useState({});
    const variantErrorRef = useRef(null);

    const handleNewVariantChange = (e) => {
        const {name, value} = e.target;

        if (name === "dimensioni") {
            setNewVariant(prev => ({
                ...prev,
                dimensioni: {...prev.dimensioni, ...value}
            }));
        } else {
            setNewVariant(prev => ({...prev, [name]: value}));
        }
        if (variantErrors[name]) {
            setVariantErrors(prev => ({...prev, [name]: null}));
        }
    };

    const handleAddVariant = async () => {
        // Validazione base
        const errors = {};
        if (!newVariant.nome) errors.nome = "Nome obbligatorio";
        if (!newVariant.prezzo) errors.prezzo = "Prezzo obbligatorio";
        if (!newVariant.dimensioni.length) errors.length = "Lunghezza obbligatoria";
        if (!newVariant.dimensioni.width) errors.larghezza = "Larghezza obbligatoria";
        if (!newVariant.dimensioni.height) errors.height = "Altezza obbligatoria";
        if (!newVariant.dimensioni.weight) errors.weight = "Peso obbligatorio";

        if (Object.keys(errors).length > 0) {
            setVariantErrors(errors);
            return;
        }

        try {
            await axios.post(`/api/libri/${bookId}/variante`, {
                nome: newVariant.nome,
                dimensioni: {
                    length: parseFloat(newVariant.dimensioni.length),
                    width: parseFloat(newVariant.dimensioni.width),
                    height: parseFloat(newVariant.dimensioni.height),
                    weight: parseFloat(newVariant.dimensioni.weight)
                },
                prezzo: parseFloat(newVariant.prezzo)
            });
            toast.success("Variante aggiunta!");
            setShowAddVariantPopup(false);

            setNewVariant({
                nome: '',
                dimensioni: {length: '', width: '', height: '', weight: ''},
                prezzo: '',
            });

            setVariantErrors({});
            queryClient.invalidateQueries(['book', bookId]);
        } catch (err) {
            toast.error("Errore nell'aggiunta variante");
        }
    };


    return <>
        {showAddVariantPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Aggiungi Nuova Variante</h3>
                        <button
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                            onClick={() => {
                                setShowAddVariantPopup(false);
                                setNewVariant({
                                    nome: '',
                                    dimensioni: {length: '', width: '', height: '', weight: ''},
                                    prezzo: ''
                                });
                                setVariantErrors({});
                            }}
                        >
                            ×
                        </button>
                    </div>


                    <VariantForm
                        variantData={newVariant}
                        handleChange={handleNewVariantChange}
                        errors={variantErrors}
                        errorRef={variantErrorRef}
                    />

                    <div className="flex gap-3 mt-6">
                        <button
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded transition-colors"
                            onClick={() => {
                                setShowAddVariantPopup(false);
                                setNewVariant({
                                    nome: '',
                                    dimensioni: {length: '', width: '', height: '', weight: ''},
                                    prezzo: ''
                                });
                                setVariantErrors({});
                            }}
                        >
                            Annulla
                        </button>
                        <button
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                            onClick={handleAddVariant}
                        >
                            Aggiungi Variante
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
}

export default CreateVariant;