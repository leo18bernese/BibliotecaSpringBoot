import React from "react";

const RecensioneInfo = ({recensione, username}) => {

    return (
        <div className="border-b border-gray-200 pb-4 last:border-0" key={recensione.id}
             id={`review-${recensione.id}`} tabIndex="-1">

            <div className="flex items-center mb-1">
                    <span className="text-yellow-500 text-2xl">
                      {'★'.repeat(recensione.stelle)}{'☆'.repeat(5 - recensione.stelle)}
                    </span>
                <span className="ml-2 font-bold">{recensione.titolo}</span>
            </div>

            <p className="text-gray-500 text-sm mb-4">
                Pubblicato
                il {new Date(recensione.dataCreazione).toLocaleDateString()} da {username}
            </p>

            {recensione.testo !== "" && <p className="mb-4">{recensione.testo}</p>}

            <div className="flex gap-4">
                {recensione.approvato &&
                    <span className="text-green-600 font-bold">Approvato</span>}
                {recensione.consigliato &&
                    <span className="text-blue-600 font-bold">Consigliato</span>}
            </div>

            {recensione.dataCreazione !== recensione.dataModifica && (
                <p className="text-gray-500 text-sm mt-2">
                    Ultima modifica: new Date(recensione.dataModifica).toLocaleDateString()
                </p>
            )}
        </div>
    );
}

export default RecensioneInfo;