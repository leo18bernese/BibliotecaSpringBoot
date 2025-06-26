import React, { useState } from 'react';
// Importa useIMask
import {IMask, useIMask} from 'react-imask';

const PaymentForm = () => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
    });
    const [errors, setErrors] = useState({});

    // --- Per Numero Carta ---
    const { ref: cardNumberRef, maskRef: cardNumberMaskRef } = useIMask({
        mask: '0000 0000 0000 0000',
        // Puoi aggiungere logic per il type di carta se vuoi
    }, {
        onAccept: (value) => setFormData(prev => ({ ...prev, cardNumber: value }))
    });

    // --- Per Scadenza ---
    const { ref: expiryRef, maskRef: expiryMaskRef } = useIMask({
        mask: 'MM/YY',
        blocks: {
            MM: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 12,
                autofix: true,
            },
            YY: {
                mask: IMask.MaskedRange,
                from: new Date().getFullYear() % 100, // Partendo dall'anno corrente
                to: (new Date().getFullYear() % 100) + 11, // Fino a 10 anni nel futuro
                autofix: true,
            },
        },
    }, {
        onAccept: (value) => setFormData(prev => ({ ...prev, expiry: value }))
    });

    const { ref: cvvRef } = useIMask({
        mask: '000', // CVV può essere 3 o 4 cifre, ma qui lo limitiamo a 4 per semplicità
    }, {
        onAccept: (value) => setFormData(prev => ({ ...prev, cvv: value }))
    });

    const validate = () => {
        const newErrors = {};

        // La validazione deve essere adattata per le stringhe pulite ottenute da IMask
        // La regex per cardNumber potrebbe aver bisogno di essere più flessibile se IMask include spazi

        if (!/^[0-9]{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) { // Rimuovi spazi per validazione
            newErrors.cardNumber = 'Numero carta non valido.';
        }
        if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(formData.expiry)) {
            newErrors.expiry = 'Formato scadenza non valido (MM/AA).';
        }
        if (!/^[0-9]{3,4}$/.test(formData.cvv)) {
            newErrors.cvv = 'CVV non valido.';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Pagamento inviato:', formData);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Numero Carta</label>
                <input
                    ref={cardNumberRef} // Passa il ref qui
                    name="cardNumber"
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2  ${errors.cardNumber ? 'border-red-500' : ''}`}
                    placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Scadenza</label>
                    <input
                        ref={expiryRef} // Passa il ref qui
                        name="expiry"
                        className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.expiry ? 'border-red-500' : ''}`}
                        placeholder="MM/AA"
                    />
                    {errors.expiry && <p className="text-red-500 text-sm">{errors.expiry}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">CVV</label>
                    <input
                        ref={cvvRef} // Passa il ref qui
                        name="cvv"
                        value={formData.cvv}
                        className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.cvv ? 'border-red-500' : ''}`}
                        placeholder="123"
                    />
                    {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
                </div>
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Paga con Carta di Credito
            </button>
        </form>
    );
};

export default PaymentForm;