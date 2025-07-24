import React, {useContext, useState, useRef, useEffect} from 'react';
import axios from 'axios';
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {Link, useNavigate, useParams} from "react-router-dom";
import toast, {Toaster} from "react-hot-toast";
import {Button} from "antd";

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const fetchExistReso = async (id) => {
    const response = await axios.get(`/api/admin/resi/${id}/exists`);
    return response.data;
}

const fetchReso = async (id) => {
    const response = await axios.get(`/api/admin/resi/${id}`);
    console.log(response.data);
    return response.data;
}


const AdminResoChat = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const queryClient = useQueryClient();

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

    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [reso?.messaggi]);


    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/resi/${id}`, (message) => {
                    queryClient.invalidateQueries(['adminReso', id]); // aggiorna la chat
                    console.log("Nuovo messaggio ricevuto:", message.body);
                });
            }
        });

        client.activate();

        return () => client.deactivate();
    }, [id, queryClient]);


    const addMessage = async (text) => {
        const request = {
            testo: text,
            allegati: []
        };

        try {
            const {data} = await axios.post(`/api/admin/resi/${id}/chat`, request);

            toast.success("Messaggio inviato con successo!");
            await queryClient.invalidateQueries(['adminReso', id]); // Refresh the chat messages

            console.log(data);

        } catch (error) {
            console.error("Errore durante l'invio del messaggio:", error);
            toast.error("Errore durante l'invio del messaggio: " + (error.response?.data?.message || error.message));
            throw error;
        }


    }

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

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Toaster/>

            <div id="tracking" className="p-8 bg-white shadow-md rounded-lg flex flex-col" style={{height: '80vh'}}>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold">Chat del Reso #{reso.id}</h1>
                        <p className="text-gray-500">Chat con l'utente per il reso.</p>
                        <p className="text-gray-500">Si consiglia di usare i comandi predefiniti per comunicare con il cliente se possibile.</p>
                    </div>

                    <button
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        onClick={() => navigate(`/admin/reso/${id}`)}>
                        Indietro
                    </button>
                </div>

                <div ref={messagesContainerRef} className="mt-4 overflow-y-auto flex-grow pr-4 p-4 bg-gray-100">
                    {reso.messaggi.map((msg, index) => {
                        const mine = msg.mittente === 'OPERATORE';
                        const displaySender = mine ? 'Supporto' : "Cliente ";

                        const prevMsg = index > 0 ? reso.messaggi[index - 1] : null;
                        const nextMsg = index < reso.messaggi.length - 1 ? reso.messaggi[index + 1] : null;

                        // get time difference, if less than 5 seconds, consider same sender
                        const previousDiff = prevMsg ? new Date(msg.timestamp) - new Date(prevMsg.timestamp) : null;
                        const nextDiff = nextMsg ? new Date(nextMsg.timestamp) - new Date(msg.timestamp) : null;

                        const isPrevSameSender = prevMsg && prevMsg.mittente === msg.mittente && (previousDiff === null || previousDiff < 30000);
                        const isNextSameSender = nextMsg && nextMsg.mittente === msg.mittente && (nextDiff === null || nextDiff < 30000);

                        const topSpace = isPrevSameSender ? 'mt-1' : 'mt-4';
                        const bottomSpace = isNextSameSender ? 'mb-1' : 'mb-4';

                        return (
                            <div key={index}
                                 className={`${topSpace} ${bottomSpace} flex ${mine ? 'justify-end' : 'justify-start'}`}>

                                <div className={`w-fit max-w-xs lg:max-w-sm`}>

                                    {!isPrevSameSender &&
                                        <div className={`mb-1 ${mine ? 'text-right' : 'text-left'}`}>
                                            <b className="text-gray-500 text-xs">{displaySender}</b>
                                        </div>
                                    }

                                    <div className={`mx-auto ${mine ? 'justify-end' : 'justify-start'} flex`}>
                                        <div className={`inline-block ${mine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} p-3 rounded-lg`}>
                                            {msg.testo}
                                        </div>
                                    </div>

                                    {!isNextSameSender &&
                                        <div
                                            className={`text-xs text-gray-500 mt-1 ${mine ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </div>
                                    }
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const messageText = formData.get('message').trim();

                            if (messageText) {
                                try {
                                    await addMessage(messageText);
                                    e.target.reset(); // Reset the form after sending
                                } catch (error) {
                                    console.error("Errore durante l'invio del messaggio:", error);
                                }
                            }
                        }}
                    >
                        <div className="flex items-center">
                            <input
                                type="text"
                                name="message"
                                placeholder="Scrivi un messaggio..."
                                className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <Button
                                htmlType="submit"
                                type="primary"
                                className="bg-blue-600 text-white px-4 py-2 ml-4 rounded-r-lg h-10 w-20 hover:bg-blue-700 transition-colors"
                            >
                                Invia
                            </Button>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminResoChat;