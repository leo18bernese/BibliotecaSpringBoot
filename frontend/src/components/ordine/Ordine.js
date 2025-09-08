import React, {useState} from 'react';
import axios from 'axios';
import {useQuery} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import Timeline from "./Timeline";
import OrdineItem from "./OrdineItem";

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
        enabled: !existsLoading && exists, // Only fetch ordine if it exists
        select: (data) => {
            if (data && data.items && Array.isArray(data.items)) {
                const sortedItems = [...data.items].sort((a, b) => a.dataAggiunta.localeCompare(b.dataAggiunta));
                return {...data, items: sortedItems};
            }
            return data;
        },
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

                <Timeline current={ordine.stato} stati={ordine.stati}/>

                <p className="text-center mt-8">{ordine.statoDescrizione}</p>
                <p className="text-center">{ordine.statoNext}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4  mt-8" style={{alignItems: 'start'}}>

                <div id="tracking" className="p-4 bg-white shadow-md rounded-lg ">
                    <div className="p-2 rounded flex items-center font-semibold text-black">
                        <i className="bx bx-package mr-2 text-2xl text-blue-600"></i>
                        <span>Articoli Ordinati</span>
                    </div>

                    {ordine.items.map((item) => (
                        <OrdineItem book={item} bookId={item.id} key={item.id}/>
                    ))
                    }
                </div>

                <div className="flex flex-col gap-12">

                    <div>
                        <div id="tracking" className="p-4 bg-white shadow-md rounded-lg ">
                            <div className="p-2 rounded flex items-center font-semibold text-black">
                                <i className="bx bx-info-circle mr-2 text-2xl text-blue-600"></i>
                                <span>Info Ordine</span>
                            </div>

                            <div className="flex justify-between border-b py-2 text-md ">
                                <h3 className="font-semibold text-gray-500">Data Creazione:</h3>
                                <h3 className="font-semibold text-right text-gray-800">{new Date(ordine.dataCreazione).toLocaleString()}</h3>
                            </div>

                            <div className="flex justify-between border-b py-2 text-md ">
                                <h3 className="font-semibold text-gray-500">Somma Totale:</h3>
                                <h3 className="font-semibold text-right text-gray-800">
                                    € {ordine.sommaTotale.toFixed(2)}
                                </h3>
                            </div>

                            <div className="flex justify-between border-b py-2 text-md ">
                                <h3 className="font-semibold text-gray-500">Spese Spedizione:</h3>
                                <h3 className="font-semibold text-right text-gray-800">
                                    € {ordine.speseSpedizione.toFixed(2)}
                                </h3>
                            </div>

                            <div className="flex justify-between py-2 text-md ">
                                <h3 className="font-semibold text-gray-500">Coupon:</h3>

                                <h3 className="font-semibold text-right text-gray-800 mt-1">

                                    {ordine.couponCodes.length === 0 && (
                                        <span className="p-2 rounded-2xl font-semibold uppercase text-sm"
                                              style={{backgroundColor: '#fef3c7', color: '#92400e'}}>
                                            Nessun coupon applicato
                                        </span>
                                    )}

                                    {ordine.couponCodes.map((code, index) => (
                                        <span key={index}
                                              className="p-2 rounded-2xl font-semibold uppercase text-sm  ml-2"
                                              style={{backgroundColor: '#d1fae5', color: '#065f46'}}>
                                    {code.codice} {" "}
                                </span>
                                    ))}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div id="tracking" className="p-4 bg-white shadow-md rounded-lg ">
                            <div className="p-2 rounded flex items-center font-semibold text-black">
                                <i className="bx bx-info-circle mr-2 text-2xl text-blue-600"></i>
                                <span>Info Spedizione</span>
                            </div>

                            <div className="flex justify-between border-b py-2 text-md ">
                                <h3 className="font-semibold text-gray-500">Corriere:</h3>
                                <h3 className="font-semibold text-right text-gray-800">
                                    {ordine.nomeCorriere || 'Non specificato'}
                                </h3>
                            </div>

                            <div className="flex justify-between border-b py-2 text-md ">
                                <h3 className="font-semibold text-gray-500">Tipo Spedizione:</h3>
                                <h3 className="font-semibold text-right text-gray-800">
                                    {ordine.tipoSpedizione || 'Non specificato'}
                                </h3>
                            </div>

                            <div className="flex justify-between border-b py-2 text-md ">
                                <h3 className="font-semibold text-gray-500">Indirizzo di Spedizione:</h3>
                                <h3 className="font-semibold text-right text-gray-800">
                                    {ordine.indirizzoFormat || 'Non specificato'}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div id="tracking" className="p-4 bg-white shadow-md rounded-lg ">
                        <div className="p-2 rounded flex items-center font-semibold text-black">
                            <i className="bx bx-info-circle mr-2 text-2xl text-blue-600"></i>
                            <span>Info Pagamento</span>
                        </div>

                        <div className="flex justify-between border-b py-2 text-md ">
                            <h3 className="font-semibold text-gray-500">Metodo:</h3>
                            <h3 className="font-semibold text-right text-gray-800">
                                {ordine.metodoPagamento || 'Errore nel recupero'}
                            </h3>
                        </div>

                        <div className="flex justify-between border-b py-2 text-md ">
                            <h3 className="font-semibold text-gray-500">Id Transazione:</h3>
                            <h3 className="font-semibold text-right text-gray-800">
                                {ordine.idTransazione || 'Non trovato'}
                            </h3>
                        </div>
                    </div>


                </div>

            </div>
        </div>
    );
}

export default Ordine;