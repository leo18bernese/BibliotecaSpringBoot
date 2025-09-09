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
        prezzo: '',
        dimensioni: {larghezza: '', altezza: '', profondita: ''}
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
        if (!newVariant.dimensioni.larghezza) errors.larghezza = "Larghezza obbligatoria";
        if (!newVariant.dimensioni.altezza) errors.altezza = "Altezza obbligatoria";
        if (!newVariant.dimensioni.profondita) errors.profondita = "Profondità obbligatoria";
        if (Object.keys(errors).length > 0) {
            setVariantErrors(errors);
            return;
        }

        try {
            await axios.post(`/api/libri/${bookId}/variante`, {
                nome: newVariant.nome,
                prezzo: parseFloat(newVariant.prezzo),
                dimensioni: {
                    larghezza: parseFloat(newVariant.dimensioni.larghezza),
                    altezza: parseFloat(newVariant.dimensioni.altezza),
                    profondita: parseFloat(newVariant.dimensioni.profondita)
                }
            });
            toast.success("Variante aggiunta!");
            setShowAddVariantPopup(false);
            setNewVariant({
                nome: '',
                prezzo: '',
                dimensioni: {larghezza: '', altezza: '', profondita: ''}
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
                                    prezzo: '',
                                    dimensioni: {larghezza: '', altezza: '', profondita: ''}
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
                                    prezzo: '',
                                    dimensioni: {larghezza: '', altezza: '', profondita: ''}
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