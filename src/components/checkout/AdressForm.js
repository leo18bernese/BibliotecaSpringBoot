import React, { useState } from 'react';

const AdressForm = () => {
    const [addressData, setAddressData] = useState({
        name: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddressData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!addressData.name) {
            newErrors.name = 'Name is required.';
        }
        if (!addressData.address) {
            newErrors.address = 'Address is required.';
        }
        if (!addressData.city) {
            newErrors.city = 'City is required.';
        }
        if (!addressData.postalCode) {
            newErrors.postalCode = 'Postal code is required.';
        }
        if (!addressData.country) {
            newErrors.country = 'Country is required.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Address submitted:', addressData);
            // Here you would typically handle the form submission, e.g., sending the data to an API
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    name="name"
                    value={addressData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                    type="text"
                    name="address"
                    value={addressData.address}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.address ? 'border-red-500' : ''}`}
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                    type="text"
                    name="city"
                    value={addressData.city}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.city ? 'border-red-500' : ''}`}
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                    type="text"
                    name="postalCode"
                    value={addressData.postalCode}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.postalCode ? 'border-red-500' : ''}`}
                />
                {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                    type="text"
                    name="country"
                    value={addressData.country}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.country ? 'border-red-500' : ''}`}
                />
                {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Submit Address
            </button>
        </form>
    );
};

export default AdressForm;