import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const loadMessageAttachments = async (resoId, messageId) => {
    try {
        const response = await axios.get(`/api/resi/${resoId}/chat/${messageId}/attachments/all`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return []; // No attachments, not an error
        }
        throw error;
    }
};

const AttachmentFile = ({ file }) => {
    const getFileUrl = (file) => {
        return `/api/resi/allegato/${file.id}`;
    };

    const renderAttachment = () => {
        const url = getFileUrl(file);
        const fileType = file.tipo;

        if (fileType.startsWith('image/')) {
            return <img src={url} alt={file.nome} className="max-h-40 mb-1 rounded" />;
        }
        if (fileType.startsWith('video/')) {
            return <video src={url} controls className="max-h-40 mb-1 rounded" />;
        }
        if (fileType.startsWith('audio/')) {
            return <audio src={url} controls className="w-full h-10 mb-1" />;
        }
        return (
            <div className="p-2 bg-gray-300 rounded">
                <p>{file.nome}</p>
            </div>
        );
    };

    return (
        <div className="text-sm text-gray-700 p-2 bg-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-1">
                <p className="font-medium truncate max-w-[150px]">{file.nome}</p>
            </div>

            {renderAttachment()}

            <p className="text-xs text-right">
                ({(file.dimensione / 1024).toFixed(2)} KB)
                <a href={getFileUrl(file)} download={file.nome} className="ml-2 text-blue-500 hover:text-blue-700">
                    Download
                </a>
            </p>
        </div>
    );
};

const MessageAttachments = ({ resoId, messageId }) => {
    const { data: attachments, isLoading, error } = useQuery({
        queryKey: ['messageAttachments', resoId, messageId],
        queryFn: () => loadMessageAttachments(resoId, messageId),
        enabled: !!messageId,
        onError: (err) => {
            toast.error("Errore caricamento allegati: " + (err.response?.data?.message || err.message));
        }
    });

    if (isLoading) return null;
    if (error) return null;
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="mt-2 flex flex-row flex-wrap gap-2">
            {attachments.map(file => (
                <AttachmentFile key={file.id} file={file} />
            ))}
        </div>
    );
};

export default MessageAttachments;

