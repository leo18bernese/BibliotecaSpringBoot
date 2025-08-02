import React, {useContext, useState} from 'react';
import axios from 'axios';
import {useQuery} from "@tanstack/react-query";
import {Link, useNavigate, useParams} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import AddStateForm from "./form/AddStateForm";
import AdminResoItem from "./AdminResoItem";

const fetchExistReso = async (id) => {
    const response = await axios.get(`/api/admin/resi/${id}/exists`);
    return response.data;
}

const fetchReso = async (id) => {
    const response = await axios.get(`/api/admin/resi/${id}`);
    console.log(response.data);
    return response.data;
}

const fetchEnumStati = async () => {
    const response = await axios.get('/api/admin/resi/stati');
    return response.data;
}

const AdminReso = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const {data: exists, isLoading: existsLoading, error: existsError} = useQuery({
        queryKey: ['resoExists', id],
        queryFn: () => fetchExistReso(id),
        onError: (err) => {
            setError(err.message);
        }
    });


    const {data: reso, isLoading, error: queryError} = useQuery({
        queryKey: ['adminReso', id],
        queryFn: () => fetchReso(id),
        onError: (err) => {
            setError(err.message);
        },
        enabled: !existsLoading && exists, // Only fetch reso if it exists
        select: (data) => {
            if (data && data.items && Array.isArray(data.items)) {
                const sortedItems = [...data.items].sort((a, b) => a.dataAggiunta.localeCompare(b.dataAggiunta));
                return {...data, items: sortedItems};
            }
            return data;
        },
    });

    const {data: enumStati, isLoading: enumLoading, error: enumError} = useQuery({
        queryKey: ['enumStati'],
        queryFn: fetchEnumStati,
        onError: (err) => {
            setError(err.message);
        }
    });

    if (existsLoading || isLoading) return <div>Caricamento...</div>;
    if (!exists) return <div className="p-4 ">
        Non siamo riusciti a trovare il reso con ID #{id}.
        Possibili cause:

        <ul className="my-5 " style={{listStyleType: 'disc', paddingLeft: '20px'}}>
            <li>Il reso non esiste.</li>
            <li>Hai inserito un ID errato.</li>
            <li>Il server non è raggiungibile.</li>
            <li>Il reso non apparte al tuo account.</li>
            <li>La richiesta di reso non è stato ancora creata.</li>
        </ul>

        La preghiamo di assicurarsi che l'ID sia corretto e che il reso sia stato effettuato con il suo account. <br/>
        Se il problema persiste, contatti il supporto clienti.
    </div>;
    if (queryError || error) return <div>Error: {error || queryError.message}</div>;

    const colors = {
        "wait": "bg-yellow-100 text-yellow-800",
        "error": "bg-red-100 text-red-800",
        "ok": "bg-green-100 text-green-800",
    }

    console.log(reso);

    const warn = reso.statoWarning;
    const attesa = reso.stato === "IN_ATTESA";
    const colorClass = warn ? colors.error : (attesa ? colors.wait : colors.ok);

    return (
        <div className="container mx-auto px-4 py-8">
            <Toaster/>

            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4  mt-8" style={{alignItems: 'start'}}>

                <div className="flex flex-col gap-4">
                    <div>

                        <div id="tracking" className="p-4 bg-white shadow-md rounded-lg">

                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-semibold">Reso #{reso.id}</h1>
                                </div>

                                <button
                                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                                    onClick={() => navigate(`/admin/reso/${id}/chat`)}>

                                    <div className=" flex items-center ">
                                        <i className="bx bx-message-dots mr-2 text-xl "></i>
                                        <span>Vai alla Chat</span>
                                    </div>

                                </button>
                            </div>


                            <div className="mt-4 mb-4">
                            <span className={`p-2 rounded-2xl font-semibold uppercase text-sm mb ${colorClass}`}>
                                <span className="">{reso.statoName}</span>
                            </span>
                            </div>

                            <p className="mt-8 text-gray-800">{reso.statoDescrizione}</p>

                            <div className="margin-top flex items-center mt-4">

                                {/* metti in attesa con motivo */}
                                <button
                                    onClick={() => navigate(`/admin/reso/${id}/attendi`)}
                                    className="mr-2 py-2 px-4 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
                                >
                                    Metti in attesa
                                </button>


                                {/* chiedi prove */}
                                <button
                                    onClick={() => navigate(`/admin/reso/${id}/prove`)}
                                    className="mr-2 py-2 px-4 rounded-md bg-gray-400 hover:bg-gray-400 text-white transition-colors"
                                >
                                    Chiedi prove
                                </button>


                                {/* approva reso */}

                                <button
                                    onClick={() => navigate(`/admin/reso/${id}/approva`)}
                                    className="mr-2 py-2 px-4 rounded-md bg-green-200 hover:bg-green-300 text-green-600 transition-colors"
                                >
                                    Approva reso
                                </button>


                                {/* rifiuta reso */}
                                <button
                                    onClick={() => navigate(`/admin/reso/${id}/rifiuta`)}
                                    className="mr-2 py-2 px-4 rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors"
                                >
                                    Rifiuta reso
                                </button>

                                {/*annulla reso */}
                                <button
                                    onClick={() => navigate(`/admin/reso/${id}/annulla`)}
                                    className="mr-2 py-2 px-4 rounded-md bg-gray-300 hover:bg-gray-400 text-black transition-colors"
                                >
                                    Annulla reso
                                </button>

                            </div>
                        </div>
                    </div>

                    <div id="tracking" className="p-4 bg-white shadow-md rounded-lg ">
                        <div className="p-2 rounded flex items-center font-semibold text-black">
                            <i className="bx bx-package mr-2 text-2xl text-blue-600"></i>
                            <span>Articoli di Reso</span>
                        </div>

                        {reso.items.map((item) => (
                            <>
                                <AdminResoItem item={item} key={item.id}/>
                            </>
                        ))}

                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div id="tracking" className="p-6 bg-white shadow-md rounded-lg ">
                        <div className="p-2 rounded flex items-center font-semibold text-black">
                            <i className="bx bx-history mr-2 text-2xl text-blue-600"></i>
                            <span>Storico stati</span>
                        </div>


                        {reso.stati.map((stato) => (
                            <div className="p-2 mb-3 border-b" key={stato.id}>
                                <h2 className="text-sm font-semibold text-gray-800">
                                    {stato.stato} - {new Date(stato.dataAggiornamento).toLocaleString()}
                                </h2>

                                {stato.messaggio && (
                                    <div className="text-sm text-gray-700">{stato.messaggio}</div>
                                )}
                            </div>
                        ))}

                        {enumStati && <AddStateForm resoId={reso.id} stati={enumStati}/>}

                    </div>

                    <div id="tracking" className="p-4 bg-white shadow-md rounded-lg ">
                        <div className="p-2 rounded flex items-center font-semibold text-black">
                            <i className="bx bx-info-circle mr-2 text-2xl text-blue-600"></i>
                            <span>Info Reso</span>
                        </div>

                        <div className="flex justify-between border-b py-2 text-md ">
                            <h3 className="font-semibold text-gray-500">Data Creazione:</h3>
                            <h3 className="font-semibold text-right text-gray-800">{new Date(reso.dataCreazione).toLocaleString()}
                            </h3>
                        </div>

                        <div className="flex justify-between border-b py-2 text-md ">
                            <h3 className="font-semibold text-gray-500">Totale reso stimato:</h3>
                            <h3 className="font-semibold text-right text-gray-800">{reso.totaleReso} €</h3>
                        </div>
                    </div>
                </div>


            </div>


            <div className="grid grid-cols-1 lg:grid-cols-[50%_50%] gap-4  mt-8" style={{alignItems: 'start'}}>


                <div className="flex flex-col gap-12">

                    <div>

                    </div>
                </div>
            </div>
        </div>
    )
        ;
}

export default AdminReso;