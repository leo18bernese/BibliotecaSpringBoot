import React, {useContext, useState, useRef, useEffect} from 'react';
import axios from 'axios';
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {Link, useNavigate, useParams} from "react-router-dom";
import toast, {Toaster} from "react-hot-toast";
import ResoTimeline from "./ResoTimeline";
import ResoItem from "./ResoItem";
import {Button} from "antd";
import MessageAttachments from "./MessageAttachments";


import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const fetchExistOrdine = async (id) => {
    const response = await axios.get(`/api/resi/${id}/exists`);
    return response.data;
}

const fetchOrdine = async (id) => {
    const response = await axios.get(`/api/resi/${id}`);
    console.log(response.data);
    return response.data;
}

const ResoChat = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const queryClient = useQueryClient();

    const [attachments, setAttachments] = useState([]);

    const {data: exists, isLoading: existsLoading, error: existsError} = useQuery({
        queryKey: ['resoExists', id],
        queryFn: () => fetchExistOrdine(id),
        onError: (err) => {
            setError(err.message);
        }
    });


    const {data: reso, isLoading, error: queryError} = useQuery({
        queryKey: ['reso', id],
        queryFn: () => fetchOrdine(id),
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
                    queryClient.invalidateQueries(['reso', id]); // aggiorna la chat
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
            const {data} = await axios.post(`/api/resi/${id}/chat`, request);

            toast.success("Messaggio inviato con successo!");

            console.log(data);

            const messageId = data.id;

            // Upload degli allegati (se presenti)
            if (attachments.length > 0) {
                await handleAttachmentsUpload(messageId);
            }

            // Refresh dei messaggi chat solo dopo aver completato tutto
            await queryClient.invalidateQueries(['reso', id]);

        } catch (error) {
            console.error("Errore durante l'invio del messaggio:", error);
            toast.error("Errore durante l'invio del messaggio: " + (error.response?.data?.message || error.message));
            throw error;
        }
    }

    const handleAttachmentsUpload = async (messageId) => {
        if (attachments.length === 0) {
            return;
        }

        try {
            const formData = new FormData();

            // Aggiungi tutti i file al FormData
            attachments.forEach(attachment => {
                formData.append('files', attachment);
            });

            console.log(`Caricando ${attachments.length} allegati per il messaggio ${messageId}`);

            const response = await axios.post(`/api/resi/${id}/chat/${messageId}/attachments`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Tutti i file caricati con successo:', response.data);
            toast.success(`${attachments.length} allegati caricati con successo!`);

        } catch (error) {
            console.error('Errore durante il caricamento degli allegati:', error);
            toast.error("Errore durante il caricamento degli allegati: " + (error.response?.data || error.message));
            throw error; // Rilancia l'errore per gestirlo nel chiamante se necessario
        } finally {
            setAttachments([]); // Pulisci gli allegati dopo il tentativo di upload
        }
    }

    const addAttachmentToMessage = async (file) => {
        setAttachments([...attachments, file]);
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

            <div id="tracking" className="p-8 bg-white shadow-md rounded-lg flex flex-col" style={{height: '86vh'}}>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold">Chat del Reso #{reso.id}</h1>
                        <p className="text-gray-500">Chat con il servizio clienti per il reso. Scrivere solo in merito a
                            questo
                            reso.</p>
                    </div>

                    <button
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        onClick={() => navigate(`/reso/${id}`)}>
                        Indietro
                    </button>
                </div>

                <div ref={messagesContainerRef} className="mt-4 overflow-y-auto flex-grow pr-4 p-4 bg-gray-100">
                    {reso.messaggi.map((msg, index) => {
                        const mine = msg.mittente === 'UTENTE';
                        const displaySender = mine ? 'Tu' : 'Supporto';

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
                                        <div
                                            className={`inline-block ${mine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} p-3 rounded-lg`}>
                                            {msg.testo}

                                            <MessageAttachments resoId={reso.id} messageId={msg.id} />
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

                <div className="mt-4 flex-shrink-0">
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
                        {attachments.length > 0 && (
                            <div className="mb-2 p-2 border rounded-lg" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                <h3 className="text-sm font-semibold mb-2">Allegati:</h3>
                                <div className="flex flex-row flex-wrap gap-2">
                                    {attachments.map((file, index) => (
                                        <div key={index} className="text-sm text-gray-700 p-2 bg-gray-200 rounded-lg">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-medium truncate max-w-[150px]">{file.name}</p>
                                                <button
                                                    type="button"
                                                    className="text-red-500 hover:text-red-700 ml-2 text-lg leading-none"
                                                    onClick={() => {
                                                        setAttachments(attachments.filter((_, i) => i !== index));
                                                    }}
                                                > &times;
                                                </button>
                                            </div>

                                            {file.type.startsWith('image/') && (
                                                <img src={URL.createObjectURL(file)} alt={file.name}
                                                     className="max-h-20 mb-1 rounded"/>
                                            )}
                                            {file.type.startsWith('video/') && (
                                                <video src={URL.createObjectURL(file)} controls
                                                       className="max-h-20 mb-1 rounded"/>
                                            )}
                                            {file.type.startsWith('audio/') && (
                                                <audio src={URL.createObjectURL(file)} controls
                                                       className="w-full h-8 mb-1"/>
                                            )}

                                            <p className="text-xs text-right">
                                                ({(file.size / 1024).toFixed(2)} KB)
                                                <a href={URL.createObjectURL(file)} download={file.name}
                                                   className="ml-2 text-blue-500 hover:text-blue-700">
                                                    Download
                                                </a>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center">
                            <input
                                type="text"
                                name="message"
                                placeholder="Scrivi un messaggio..."
                                className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <label className="p-1.5 mx-2 border cursor-pointer hover:bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                                </svg>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        setAttachments(prev => [...prev, ...files]);
                                        e.target.value = ''; // Reset file input
                                    }}
                                    className="hidden"
                                />
                            </label>
                            <Button
                                htmlType="submit"
                                type="primary"
                                className="bg-blue-600 text-white px-4 rounded-r-lg h-10 hover:bg-blue-700 transition-colors"
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

export default ResoChat;

