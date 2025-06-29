import React, {useContext, useState} from 'react';
import axios from 'axios';
import {useQuery} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import Timeline from "./Timeline";

const fetchExistOrdine = async (id) => {
    const response = await axios.get(`/api/ordini/${id}/exists`);
    return response.data;
}

const fetchOrdine = async (id) => {
    const response = await axios.get(`/api/ordini/${id}`);
    return response.data;
}

const Ordine = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const {data: exists, isLoading: existsLoading, error: existsError} = useQuery({
        queryKey: ['ordineExists', id],
        queryFn: () => fetchExistOrdine(id),
        onError: (err) => {
            setError(err.message);
        }
    });


    const {data: ordine, isLoading, error: queryError} = useQuery({
        queryKey: ['ordine', id],
        queryFn: () => fetchOrdine(id),
        onError: (err) => {
            setError(err.message);
        },
        enabled: !existsLoading && exists // Only fetch ordine if it exists
    });

    if (existsLoading || isLoading) return <div>Caricamento...</div>;
    if (!exists) return <div className="p-4 ">
        Non siamo riusciti a trovare l'ordine con ID #{id}.
        Possibili cause:

        <ul className="my-5 " style={{listStyleType: 'disc', paddingLeft: '20px'}}>
            <li>L'ordine non esiste.</li>
            <li>Hai inserito un ID errato.</li>
            <li>Il server non è raggiungibile.</li>
            <li>L'ordine non appartiene al tuo account.</li>
            <li>L'ordine non è stato ancora elaborato.</li>
        </ul>

        La preghiamo di assicurarsi che l'ID sia corretto e che l'ordine sia stato effettuato con il suo account. <br/>
        Se il problema persiste, contatti il supporto clienti.
    </div>;
    if (queryError || error) return <div>Error: {error || queryError.message}</div>;

    console.log(ordine);

    return (
        <div className="container mx-auto px-4 py-8">
            <Toaster/>

            <div id="tracking" className="p-4 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-semibold">Dettagli Ordine #{ordine.id}</h1>
                <p className="text-gray-500">Traccia lo stato del tuo ordine.</p>

                <div className="mt-4 mb-10">
                <span className="p-2 rounded-2xl font-semibold uppercase text-sm mb "
                      style={{backgroundColor: '#d1fae5', color: '#065f46'}}>
                                <span className="">{ordine.statoName}</span>
                            </span>
                </div>

                <Timeline current={ordine.stato} />


            </div>
        </div>
    );
}

export default Ordine;