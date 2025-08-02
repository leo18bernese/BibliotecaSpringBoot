import React from 'react';
import axios from 'axios';
import {useQueryClient} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router-dom";
import ChatTemplate from "./ChatTemplate";

const AdminChat = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const fetchMessages = async () => {
        const response = await axios.get(`/api/admin/resi/${id}`);
        return response.data?.messaggi;
    };

    const fetchExist = async () => {
        const response = await axios.get(`/api/admin/resi/${id}/exists`);
        return response.data;
    }

    const getPostUrl = () => {
        return `/api/admin/resi/${id}/chat`;
    }

    const getUploadUrl = (messageId) => {
        return `/api/admin/resi/${id}/chat/${messageId}/attachments`;
    }

    const getSocketDestination = () => {
        return `/topic/resi/${id}`;
    }

    const getNotFoundComponent = () => {
        return <div className="p-4 ">
            Reso con ID #{id} non trovato.
            Controlla che l'ID sia corretto, che esista e di avere sufficienti permessi per visualizzarlo.
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
        return "OPERATORE";
    }

    const getOwnName = (mine) => {
        return mine ? 'Supporto' : "Cliente ";

    }
    const getBackDestination = () => {
        return `/admin/reso/${id}`;
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

export default AdminChat;