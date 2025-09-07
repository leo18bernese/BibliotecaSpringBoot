import toast from "react-hot-toast";
import React from "react";

const Indirizzo = ({addr, selectedSavedAddress, handleSavedAddressSelect}) => {

    console.log("Rendering Indirizzo for:", addr, "selectedSavedAddress:", selectedSavedAddress);
    return (
        <div key={addr.id}
             className={`border-2 px-4 py-3 rounded-md cursor-pointer transition-colors ${
                 selectedSavedAddress === addr.id
                     ? 'bg-blue-100 border-blue-500'
                     : 'border-gray-200 hover:bg-gray-50'
             }`}
             onClick={() => handleSavedAddressSelect(addr)}>

            <div className="flex flex-row justify-between">
                <div>
                    <p className="font-semibold">{addr.nome}</p>
                    <p className="text-gray-600">{addr.indirizzo}, {addr.citta}, {addr.provincia}, {addr.cap}</p>
                </div>

                <div className="flex items-center">
                    <button className="ml-4 text-xl hover:text-blue-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                toast("Edit functionality not implemented yet.");
                            }}
                            title="Modifica indirizzo">
                        <i className="bx bx-edit"></i>
                    </button>

                    <button className="ml-2 text-xl hover:text-red-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                toast("Delete functionality not implemented yet.");
                            }}
                            title="Elimina indirizzo">
                        <i className="bx bx-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Indirizzo;