import React, {memo} from 'react';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const hasAttachments = async (resoId, messageId) => {
    try {
        const response = await axios.get(`/api/resi/${resoId}/chat/${messageId}/attachments/has`);
        console.log("Has attachments response: " + messageId + " " + response);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false; // Nessun allegato trovato
        }

        throw error; // Rilancia l'errore per gestirlo altrove
    }
}

const getAttachmentsContent = async (resoId, messageId) => {
    try {
        const response = await axios.get(`/api/resi/${resoId}/chat/${messageId}/attachments/content`);
        console.log("Attachments response: ", response.data);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return [];
        }
        throw error;
    }
};

const AttachmentFile = memo(({file, index}) => {
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    };

    const getFileIcon = (contentType) => {
        if (contentType.startsWith('image/')) return 'image';
        if (contentType.startsWith('video/')) return 'video';
        if (contentType.startsWith('audio/')) return 'music';
        if (contentType.includes('pdf')) return 'file-detail';
        if (contentType.includes('document') || contentType.includes('word')) return 'file-detail';
        if (contentType.includes('sheet') || contentType.includes('excel')) return 'file-report';
        if (contentType.includes('presentation') || contentType.includes('powerpoint')) return 'file-report';
        if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('compressed')) return 'file-zip';
        return 'file';
    };

    const renderAttachment = () => {
        const {contentType, base64Content, nome, size} = file;

        // Crea l'URL data per visualizzare il file
        const dataUrl = `data:${contentType};base64,${base64Content}`;

        if (contentType.startsWith('image/')) {
            return (
                <img
                    src={dataUrl}
                    alt={nome}
                    className="max-h-40 mb-1 rounded cursor-pointer hover:opacity-90 transition-opacity"
                    loading="lazy"
                    onClick={() => {
                        // Apri l'immagine in una nuova finestra per visualizzazione a schermo intero
                        const newWindow = window.open();
                        newWindow.document.write(`
                            <html>
                                <head><title>${nome}</title></head>
                                <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
                                    <img src="${dataUrl}" alt="${nome}" style="max-width: 100%; max-height: 100vh; object-fit: contain;" />
                                </body>
                            </html>
                        `);
                    }}
                />
            );
        }

        if (contentType.startsWith('video/')) {
            return (
                <video
                    src={dataUrl}
                    controls
                    className="max-h-40 mb-1 rounded"
                    preload="metadata"
                />
            );
        }

        if (contentType.startsWith('audio/')) {
            return (
                <audio
                    src={dataUrl}
                    controls
                    className="w-full h-10 mb-1"
                    preload="metadata"
                />
            );
        }

        return (
            <div className="p-3 bg-gray-100 rounded border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <div className="">
                    <p>We could not display this file directly or give a preview, but you can download it:</p>
                    <div className="flex-1">
                        <a
                            href={dataUrl}
                            download={nome}
                            className="text-blue-600 hover:text-blue-800 underline font-medium block"
                        >
                            Click here to download
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="text-sm text-gray-700 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-1">
                    <i className={`bx bx-${getFileIcon(file.contentType)} text-2xl`}></i>
                </div>
                <div className="text-xs text-gray-500 ml-2 text-right">
                    <div>{file.contentType.split('/')[1]?.toUpperCase()}</div>
                    <div>{formatFileSize(file.size)}</div>
                </div>
            </div>
            {renderAttachment()}
        </div>
    );
});

const MessageAttachments = memo(({resoId, messageId}) => {

    const {data: hasAttachmentsData, isLoading: hasAttachmentsLoading, error: hasAttachmentsError} = useQuery({
        queryKey: ['hasAttachments', resoId, messageId],
        queryFn: () => hasAttachments(resoId, messageId),
        enabled: !!messageId && !!resoId,
        staleTime: Infinity,
        cacheTime: Infinity, // 15 minuti
        onError: (err) => {
            console.error("Errore verifica allegati:", err);
            // Non mostrare toast per errori 404 (nessun allegato)
            if (err.response?.status !== 404) {
                toast.error("Errore verifica allegati: " + (err.response?.data?.message || err.message));
            }
        }
    });

    const {data: attachments, isLoading, error} = useQuery({
        queryKey: ['messageAttachments', resoId, messageId],
        queryFn: () => getAttachmentsContent(resoId, messageId),
        enabled: !!messageId && !!resoId && hasAttachmentsData,
        staleTime: Infinity,
        cacheTime: Infinity, // 15 minuti
        onError: (err) => {
            console.error("Errore caricamento allegati:", err);
            // Non mostrare toast per errori 404 (nessun allegato)
            if (err.response?.status !== 404) {
                toast.error("Errore caricamento allegati: " + (err.response?.data?.message || err.message));
            }
        }
    });

    if (hasAttachmentsLoading || isLoading) return null;

    if (error && error.response?.status !== 404) {
        console.error("Errore caricamento allegati:", error);
        return <div className="mt-2 text-sm text-red-500">
            Impossibile caricare gli allegati.
        </div>;
    }

    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="mt-2 flex flex-row flex-wrap gap-2">
            {attachments.map((file, index) => (
                <AttachmentFile
                    key={`${messageId}-${index}`}
                    file={file}
                    index={index}
                />
            ))}
        </div>
    );
});

export default MessageAttachments;

