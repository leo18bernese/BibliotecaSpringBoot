import React, {useContext} from "react";
import axios from "axios";
import {UserContext} from "../user/UserContext";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {useAuth} from "../user/AuthContext";

const markUtile = async (reviewId) => {
    const {data} = await axios.post(`/api/recensioni/${reviewId}/utile`);
    return data;
}

const RecensioneInfo = ({recensione, username}) => {

    const {user} = useContext(UserContext);
    const {showLoginPrompt} = useAuth();
    const queryClient = useQueryClient();

    const addUtile = async (reviewId) => {
        if (!user) {
            showLoginPrompt();
            return;
        }

        markUtileMutation.mutate({reviewId});
    }

    const markUtileMutation = useMutation({
        mutationFn: ({reviewId}) => markUtile(reviewId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['reviews']});
        },
        onError: (error) => {
            toast.error("Errore nel marcare la recensione come utile: " + (error.response?.data?.message || error.message));
        }
    });


    return (
        <div className="border-b border-gray-200 pb-4 last:border-0" key={recensione.id}
             id={`review-${recensione.id}`} tabIndex="-1">

            <div className="flex items-center mb-1">
                    <span className="text-yellow-500 text-2xl">
                      {'★'.repeat(recensione.stelle)}{'☆'.repeat(5 - recensione.stelle)}
                    </span>
                <span className="ml-2 font-bold">{recensione.titolo}</span>
            </div>

            <p className="text-gray-500 text-sm mb-4">
                Pubblicato
                il {new Date(recensione.dataCreazione).toLocaleDateString()} da {username}
            </p>

            {recensione.testo !== "" && <p className="mb-4">{recensione.testo}</p>}


            <div className="flex gap-4 ml-4">
                <span className="flex items-center gap-1">
                    <i className={`bx ${recensione.approvato ? "bxs-check-circle text-green-600" : "bx-x-circle text-gray-400"} text-xl`}></i>
                    <span
                        className={recensione.approvato ? "text-green-600 font-bold" : "text-gray-400"}>Approvato</span>
                </span>

                <span className="flex items-center gap-1">
                    <i className={`bx ${recensione.consigliato ? "bxs-check-circle text-blue-600" : "bx-x-circle text-gray-400"} text-xl`}></i>
                    <span
                        className={recensione.consigliato ? "text-blue-600 font-bold" : "text-gray-400"}>Consigliato</span>
                </span>
            </div>

            <div className="mt-7">

                {recensione.utile.length > 0 && (
                    <span className="text-gray-500 font-semibold">{recensione.utile.length} Utenti hanno trovato utile questa recensione</span>
                )}

                <button className="flex items-center gap-2 mt-2 text-gray-500 hover:text-gray-700" onClick={() => {
                    addUtile(recensione.id);
                }}>
                    {user && recensione.utile.includes(user.id) ? (
                        <i className={`bx bxs-like text-2xl  `}></i>
                    ) : (
                        <i className={`bx bx-like text-2xl  `}></i>
                    )}

                    Trovo utile

                </button>
            </div>


            {recensione.dataCreazione !== recensione.dataModifica && (
                <p className="text-gray-500 text-sm mt-2">
                    Ultima modifica: new Date(recensione.dataModifica).toLocaleDateString()
                </p>
            )}

        </div>
    );
}

export default RecensioneInfo;