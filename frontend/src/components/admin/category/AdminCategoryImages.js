import {useNavigate, useParams} from "react-router-dom";
import React from "react";
import ImageEditorTemplate from "../../ui/template/ImageEditorTemplate";

const API_URL = '/api/images';

const AdminCategoryImages = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    return (
        <ImageEditorTemplate
            endpoint={`/api/images/category`}
            existsEndpoint={`/api/categories`}
            title={`Category #${id} - Manage Images`}
            description={"Gestisci le immagini della categoria. Puoi caricare nuove immagini trascinandole qui sotto o cliccando sul " +
                "pulsante di caricamento."}
            pageTitle={"Manage Book Images"}
            notFound={(
                <>
                    <p className="text-gray-500 text-lg">Nessuna immagine trovata</p>
                    <p className="text-gray-400 text-sm">Carica la prima immagine per questa categoria!</p>
                </>
            )}
        />


    )
}

export default AdminCategoryImages;