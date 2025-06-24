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
            <div className="flex flex-col mb-6 w-1/2">

                {tabs.map((tab, index) => (
                    <button
                        className={`py-3 ${activeTab === index ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-600 border-b hover:border-blue-600 hover:text-blue-600 hover:font-semibold'}`}
                        onClick={() => handleTabChange(index)}> {tab.label}
                    </button>
                ))}
            </div>

            <PaymentPanel value={activeTab} index={1}>
                <div>
                    <h2 className="text-lg font-semibold mb-4">Pagamento con Carta di Credito</h2>
                    <p>Inserisci i dettagli della tua carta di credito.</p>

                    <PaymentForm />
                </div>
            </PaymentPanel>
        </div>
    );
};

export default PaymentTabs;