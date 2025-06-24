import React, { useState, useRef } from 'react';
import InputMask from 'react-input-mask';

const PaymentForm = () => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
    });
    const [errors, setErrors] = useState({});

    const cardNumberRef = useRef(null);
    const expiryRef = useRef(null);

    const validate = () => {
        const newErrors = {};
        if (!/^[0-9\s]{13,19}$/.test(formData.cardNumber)) {
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Numero Carta</label>
                <InputMask
                    mask="9999 9999 9999 9999"
                    maskChar=""
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.cardNumber ? 'border-red-500' : ''}`}
                    placeholder="1234 5678 9012 3456"
                    inputRef={cardNumberRef}
                />
                {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Scadenza</label>
                    <InputMask
                        mask="99/99"
                        maskChar=""
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.expiry ? 'border-red-500' : ''}`}
                        placeholder="MM/AA"
                        inputRef={expiryRef}
                    />
                    {errors.expiry && <p className="text-red-500 text-sm">{errors.expiry}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">CVV</label>
                    <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.cvv ? 'border-red-500' : ''}`}
                        placeholder="123"
                    />
                    {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
                </div>
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
                Paga con Carta di Credito
            </button>
        </form>
    );
};

export default PaymentForm;