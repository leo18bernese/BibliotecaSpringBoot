import React, {useContext} from "react";
import {UserContext} from "../../user/UserContext";
import Indirizzo from "./Indirizzo";

const Spedizione = ({
                        locationType,
                        shippingAddress,
                        setShowAddAddressPopup,
                        selectedSavedAddress,
                        handleSavedAddressSelect
                    }) => {

    const {user} = useContext(UserContext);

    console.log("selected", selectedSavedAddress);

    return <>
        {locationType === "" && (
            <p className="text-sm text-gray-600 mb-4">Seleziona un metodo di spedizione per poter
                inserire i dettagli dell'indirizzo di consegna.</p>
        )}

        {locationType === "HOME" ? (
            <div>
                <p className="text-sm text-gray-600 mb-4">Seleziona un indirizzo salvato o aggiungi un nuovo indirizzo
                    per la spedizione.</p>
                <p className="text-sm text-gray-600 mb-4">È possibile modificare l'indirizzo scelto
                    PRIMA che l'ordine venga impacchettato. <br/>
                    Se commetti un errore correggilo il prima possibile essendo che l'ordine verrà
                    gestito interamente dal corriere e non da noi.</p>

                {/* Sezione indirizzi salvati - sempre visibile */}
                <div className="mb-8">
                    <h3 className="text-md font-semibold mb-4">I tuoi indirizzi salvati:</h3>

                    {user.indirizzi.length > 0 ? (
                        <div className="space-y-3 mb-4">
                            {user.indirizzi.map((addr) => (

                                <Indirizzo addr={addr}
                                           handleSavedAddressSelect={handleSavedAddressSelect}
                                           selectedSavedAddress={selectedSavedAddress}
                                />

                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 mb-4">Nessun indirizzo salvato.</p>
                    )}

                    {/* Bottone per aggiungere nuovo indirizzo */}
                    <button
                        className="flex items-center border-2 border-dashed border-green-300 px-4 py-3 rounded-md hover:bg-green-50 cursor-pointer transition-colors w-full"
                        onClick={() => setShowAddAddressPopup(true)}>

                        <i className='bx bx-plus-circle text-2xl text-green-600'></i>
                        <span className="ml-2 font-semibold text-green-700">Aggiungi Nuovo Indirizzo</span>

                    </button>
                </div>

                {/* Visualizzazione indirizzo selezionato */}
                {shippingAddress.name && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Indirizzo di spedizione selezionato:</h4>
                        <div className="text-gray-700">
                            <p className="font-medium">{shippingAddress.name}</p>
                            <p>{shippingAddress.address}</p>
                            <p>{shippingAddress.city}, {shippingAddress.country} {shippingAddress.postalCode}</p>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div>
                <h3 className="text-md font-semibold mb-2">Seleziona un punto di ritiro</h3>
            </div>
        )}
    </>
}

export default Spedizione;