import React, {useState} from 'react';
import {useLocation} from "react-router-dom";
import PaymentForm from "./PaymentForm";

const PaymentPanel = ({children, value, index}) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
        >
            {value === index && (
                <div>
                    {children}
                </div>
            )}
        </div>
    );
};

const PaymentTabs = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (index) => {
        setActiveTab(index);
    };

    const tabs = [
        {label: 'Paypal'},
        {label: 'Carta di Credito'},
        {label: 'Bonifico Bancario'}
    ];

    return (
        <div>
            <div className="flex border-b border-gray-200 mb-6 ">

                {tabs.map((tab, index) => (
                    <button
                        className={`px-4 py-2 ${activeTab === index ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
                        onClick={() => handleTabChange(index)}> {tab.label}
                    </button>
                ))}
            </div>

            <PaymentPanel value={activeTab} index={0}>
                <div className="text-gray-700">
                    <h2 className="text-lg font-semibold mb-4">Pagamento con Paypal</h2>
                    <p>Verrai reindirizzato a Paypal nel momento in cui premi il pulsante di pagamento a fine pagina.</p>
                </div>
            </PaymentPanel>

            <PaymentPanel value={activeTab} index={1}>
                <div className="text-gray-700">
                    <h2 className="text-lg font-semibold mb-4">Pagamento con Carta di Credito</h2>
                    <p>Inserisci i dettagli della tua carta di credito.</p>

                    <PaymentForm />
                </div>
            </PaymentPanel>

            <PaymentPanel value={activeTab} index={2}>
                <div className="text-gray-700">
                    <h2 className="text-lg font-semibold mb-4">Pagamento con Bonifico Bancario</h2>
                    <p>Per effettuare il pagamento tramite bonifico bancario, utilizza le seguenti informazioni:</p>
                    <ul className="list-disc pl-5">
                        <li>Intestatario: Nome Azienda</li>
                        <li>Banca: Nome Banca</li>
                        <li>IBAN: IT00X0000000000000000000000</li>
                        <li>Causale: Numero Ordine</li>
                    </ul>
                </div>
            </PaymentPanel>
        </div>
    );
};

export default PaymentTabs;