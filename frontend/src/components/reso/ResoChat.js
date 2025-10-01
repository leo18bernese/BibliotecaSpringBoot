import React from 'react';
import axios from 'axios';
import {useQueryClient} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router-dom";
import ChatTemplate from "../admin/reso/chat/ChatTemplate";

const ResoChat = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const fetchMessages = async () => {
        const response = await axios.get(`/api/resi/${id}`);
        return response.data?.messaggi;
    };

    const fetchExist = async () => {
        const response = await axios.get(`/api/resi/${id}/exists`);
        return response.data;
    }

    const getPostUrl = () => {
        return `/api/resi/${id}/chat`;
    }

    const getUploadUrl = (messageId) => {
        return `/api/resi/${id}/chat/${messageId}/attachments`;
    }

    const getSocketDestination = () => {
        return `/topic/resi/${id}`;
    }

    const getNotFoundComponent = () => {
        return <div className="p-4 ">
            Non siamo riusciti a trovare il reso con ID #{id}.
            Possibili cause:

            <ul className="my-5 " style={{listStyleType: 'disc', paddingLeft: '20px'}}>
                <li>Il reso non esiste.</li>
                <li>Hai inserito un ID errato.</li>
                <li>Il server non è raggiungibile.</li>
                <li>Il reso non appartiene al tuo account.</li>
                <li>La richiesta di reso non è stato ancora creata.</li>
            </ul>

            La preghiamo di assicurarsi che l'ID sia corretto e che il reso sia stato effettuato con il suo
            account. <br/>
            Se il problema persiste, contatti il supporto clienti.
        </div>;
    }

    const getHeaderComponent = () => {
        return (
            <div>
                <h1 className="text-2xl font-semibold">Chat del Reso #{id}</h1>
                <p className="text-gray-500">Chat con l'utente per il reso.</p>
                <p className="text-gray-500">Si consiglia di usare i comandi predefiniti per comunicare con il cliente
                    se possibile.</p>
            </div>
        );
    }

    const getOwnType = () => {
        return "UTENTE";
    }

    const getOwnName = (mine) => {
        return mine ? 'Tu' : "Supporto ";

    }

    const getBackDestination = () => {
        return `/reso/${id}`;
    }

    return (
        <ChatTemplate
            id={id}
            fetchMessagesArray={fetchMessages}
            fetchEntityExists={fetchExist}
            getPostUrl={getPostUrl}
            getUploadUrl={getUploadUrl}
            getSocketDestination={getSocketDestination}
            getNotFoundComponent={getNotFoundComponent}
            getHeaderComponent={getHeaderComponent}
            getOwnType={getOwnType}
            getSenderDisplay={getOwnName}
            getBackDestination={getBackDestination}
        />
    );
}

export default ResoChat;