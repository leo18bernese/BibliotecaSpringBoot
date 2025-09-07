import {useNavigate} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import toast, {Toaster} from "react-hot-toast";
import SockJS from "sockjs-client";
import MessageAttachments from "../../../reso/MessageAttachments";
import {Button} from "antd";
import { Client } from '@stomp/stompjs';

const ChatTemplate = ({
    id,
    fetchMessagesArray,
    fetchEntityExists,
    getPostUrl,
    getUploadUrl,
    getSocketDestination,
    getNotFoundComponent,
    getHeaderComponent,
    getOwnType,
    getSenderDisplay,
    getBackDestination
}) => {
    const [error, setError] = useState(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [attachments, setAttachments] = useState([]);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    const {data: exists, isLoading: existsLoading} = useQuery({
        queryKey: ['chatExists', id],
        queryFn: fetchEntityExists,
        onError: (err) => setError(err.message),
    });

    const {data: messages, isLoading, error: queryError} = useQuery({
        queryKey: ['chat', id],
        queryFn: fetchMessagesArray,
        onError: (err) => setError(err.message),
        enabled: !existsLoading && exists,
        select: (data) => {
            if (data && Array.isArray(data)) { // Modificato per lavorare con l'array direttamente
                return [...data].sort(
                    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                );
            }
            return [];
        },
    });

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const { mutate: sendMessage, isLoading: isSendingMessage } = useMutation({
        mutationFn: async (messageText) => {
            const request = { testo: messageText, allegati: [] };

            // L'API restituisce il messaggio appena creato
            const { data: newMessage } = await axios.post(getPostUrl(), request);

            if (attachments.length > 0) {
                await handleAttachmentsUpload(newMessage.id);

                await queryClient.invalidateQueries({ queryKey: ['hasAttachments', id, newMessage.id] });
                await queryClient.invalidateQueries({ queryKey: ['messageAttachments', id, newMessage.id] });
            }
        },
        onSuccess: () => {
            toast.success("Messaggio inviato con successo!");
            setAttachments([]); // Pulisci gli allegati dopo l'invio
        },
        onError: (error) => {
            console.error("Errore durante l'invio del messaggio:", error);
            toast.error("Errore invio: " + (error.response?.data?.message || error.message));
        },
    });

    useEffect(() => {
        const socket = new SockJS(`${process.env.REACT_APP_BACKEND_URL}/ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(getSocketDestination(), (message) => {
                    const newMessage = JSON.parse(message.body);
                    // Aggiorna la cache quando arriva un messaggio dal websocket

                    queryClient.setQueryData(['chat', id], (oldData) => {
                        if (!Array.isArray(oldData)) {
                            return [newMessage];
                        }

                        // Evita duplicati basandoti sull'id
                        const alreadyExists = oldData.some(m => m.id === newMessage.id);
                        if (alreadyExists) {
                            return oldData;
                        }

                        // Inserisce il nuovo messaggio e ordina per timestamp
                        return [...oldData, newMessage].sort(
                            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                        );
                    });
                });
            }
        });

        client.activate();
        return () => client.deactivate();
    }, [getSocketDestination, id, messages, queryClient]);


    const handleAttachmentsUpload = async (messageId) => {
        if (attachments.length === 0) return;

        const formData = new FormData();
        attachments.forEach(attachment => formData.append('files', attachment));

        try {
            console.log(`Caricando ${attachments.length} allegati per il messaggio ${messageId}`);

            await axios.post(getUploadUrl( messageId), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000 // 60 secondi timeout
            });

            toast.success(`${attachments.length} allegati caricati!`);
        } catch (error) {
            console.error('Errore durante il caricamento degli allegati:', error);
            toast.error("Errore caricamento allegati: " + (error.response?.data || error.message));
            throw error; // Rilancia l'errore per gestirlo nella mutazione
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (isSendingMessage) return;

        const formData = new FormData(e.target);
        const messageText = formData.get('message').trim();

        if (messageText || attachments.length > 0) {
            await sendMessage(messageText);
            e.target.reset();
        }
    };

    if (existsLoading || isLoading) return <div>Caricamento...</div>;

    if (!exists) {
        return getNotFoundComponent() || <div>Chat non trovata</div>;
    }

    if (queryError || error) return <div>Error: {error || queryError.message}</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Toaster/>

            <div id="tracking" className="bg-white shadow-md rounded-lg flex flex-col h-[calc(85vh-70px)]" >

                <div className="flex justify-between items-start p-8 flex-shrink-0">

                    {getHeaderComponent()}

                    <button
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        onClick={() => navigate(getBackDestination())}>
                        Indietro
                    </button>
                </div>

                <div ref={messagesContainerRef} className="overflow-y-auto flex-1 px-8 pb-4 bg-gray-100">
                    {messages.map((msg, index) => {
                        const mine = msg.mittente === getOwnType();
                        const displaySender = getSenderDisplay(mine);

                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

                        const previousDiff = prevMsg ? new Date(msg.timestamp) - new Date(prevMsg.timestamp) : null;
                        const nextDiff = nextMsg ? new Date(nextMsg.timestamp) - new Date(msg.timestamp) : null;

                        const isPrevSameSender = prevMsg && prevMsg.mittente === msg.mittente && (previousDiff === null || previousDiff < 30000);
                        const isNextSameSender = nextMsg && nextMsg.mittente === msg.mittente && (nextDiff === null || nextDiff < 30000);

                        const topSpace = isPrevSameSender ? 'mt-1' : 'mt-4';
                        const bottomSpace = isNextSameSender ? 'mb-1' : 'mb-4';

                        return (
                            <div key={msg.id || index}
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

                                            <MessageAttachments resoId={id} messageId={msg.id} />
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

                <div className="p-8 pt-4 flex-shrink-0">
                    <form onSubmit={handleFormSubmit}>
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
                                                    disabled={isSendingMessage}
                                                    onClick={() => {
                                                        if (!isSendingMessage) {
                                                            setAttachments(attachments.filter((_, i) => i !== index));
                                                        }
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
                                disabled={isSendingMessage}
                            />
                            <label className={`p-1.5 mx-2 border cursor-pointer hover:bg-gray-100 ${isSendingMessage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                                </svg>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                                    disabled={isSendingMessage}
                                    onChange={(e) => {
                                        if (!isSendingMessage) {
                                            const files = Array.from(e.target.files);

                                            // Validazione lato client
                                            const allowedTypes = ['image/', 'video/', 'audio/', 'application/pdf', 'text/plain'];
                                            const allowedExtensions = ['.doc', '.docx'];

                                            const validFiles = files.filter(file => {
                                                const isValidType = allowedTypes.some(type => file.type.startsWith(type));
                                                const isValidExt = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
                                                return isValidType || isValidExt;
                                            });

                                            if (validFiles.length !== files.length) {
                                                alert('Alcuni file non sono supportati');
                                            }else {
                                                setAttachments(prev => [...prev, ...validFiles]);
                                                if(fileInputRef.current) fileInputRef.current.value = '';
                                            }
                                        }
                                    }}
                                    className="hidden"
                                />
                            </label>
                            <Button
                                htmlType="submit"
                                type="primary"
                                loading={isSendingMessage}
                                disabled={isSendingMessage}
                                className="bg-blue-600 text-white px-4 rounded-r-lg h-10 hover:bg-blue-700 transition-colors"
                            >
                                {isSendingMessage ? 'Invio...' : 'Invia'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatTemplate;