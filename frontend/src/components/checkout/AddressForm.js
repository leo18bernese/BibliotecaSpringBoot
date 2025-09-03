import React, { useEffect, useState } from 'react';
import { useIMask } from 'react-imask';

const AddressForm = ({ addressData, handleChange, errors, errorRef }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);

    // Maschera per il CAP (5 cifre)
    const { ref: postalCodeRef, setValue: setPostalCodeValue } = useIMask({
        mask: '00000',
    }, {
        onAccept: (value) => handleChange({ target: { name: 'postalCode', value } }),
    });

    // Maschera per campi di testo (solo lettere, spazi, apostrofi e accenti)
    const textMask = {
        mask: /^[a-zA-Z'À-ÖØ-öø-ÿ\s]*$/,
    };

    const { ref: nameRef, setValue: setNameValue } = useIMask(textMask,
        { onAccept: (value) => handleChange({ target: { name: 'name', value } }) });
    const { ref: cityRef, setValue: setCityValue } = useIMask(textMask, { onAccept: (value) => handleChange({ target: { name: 'city', value } }) });
    const { ref: countryRef, setValue: setCountryValue } = useIMask(textMask, { onAccept: (value) => handleChange({ target: { name: 'country', value } }) });

    // Effetto per l'autocompletamento dell'indirizzo
    useEffect(() => {
        const fetchAddressSuggestions = async () => {
            if (searchQuery.length > 3) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=it&addressdetails=1`);
                    const data = await response.json();
                    setAddressSuggestions(data);
                } catch (error) {
                    console.error("Errore ricerca indirizzo:", error);
                }
            } else {
                setAddressSuggestions([]);
            }
        };
        const handler = setTimeout(fetchAddressSuggestions, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // ✨ EFFETTO PER SINCRONIZZARE I CAMPI MASCHERATI CON LE PROPS
    useEffect(() => {
        setPostalCodeValue(addressData.postalCode || '');
        setNameValue(addressData.name || '');
        setCityValue(addressData.city || '');
        setCountryValue(addressData.country || '');
    }, [addressData, setPostalCodeValue, setNameValue, setCityValue, setCountryValue]);


    const handleSuggestionClick = (suggestion) => {
        const { address } = suggestion;
        const street = address.road || suggestion.display_name.split(',')[0];
        const city = address.city || address.town || address.village || '';
        const postalCode = address.postcode || '';
        const country = address.county || '';

        handleChange({ target: { name: 'address', value: street } });
        handleChange({ target: { name: 'houseNumber', value: address.house_number || '' } });
        handleChange({ target: { name: 'city', value: city } });
        handleChange({ target: { name: 'postalCode', value: postalCode } });
        handleChange({ target: { name: 'country', value: country } });

        // Questi sono già chiamati dall'effetto, ma li teniamo per chiarezza immediata
        setCityValue(city);
        setPostalCodeValue(postalCode);
        setCountryValue(country);

        setAddressSuggestions([]);
        setSearchQuery(''); // Pulisce il campo di ricerca
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input ref={node => { nameRef.current = node; if (errors.name) errorRef.current = node; }} type="text" name="name" value={addressData.name} className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.name ? 'border-red-500' : ''}`} />

                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Cerca Indirizzo</label>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoComplete="off" className="mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2" placeholder="Es. Via Roma 1, Milano" />

                {addressSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
                        {addressSuggestions.map((suggestion) => (
                            <li key={suggestion.place_id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSuggestionClick(suggestion)}>
                                {suggestion.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Indirizzo</label>
                    <input ref={errors.address ? errorRef : null} type="text" name="address" value={addressData.address} onChange={handleChange} className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.address ? 'border-red-500' : ''}`} />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Civico</label>
                    <input type="text" name="houseNumber" value={addressData.houseNumber} onChange={handleChange} className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.houseNumber ? 'border-red-500' : ''}`} />
                    {errors.houseNumber && <p className="text-red-500 text-sm">{errors.houseNumber}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Città</label>
                    <input ref={node => { cityRef.current = node; if (errors.city) errorRef.current = node; }} type="text" name="city" value={addressData.city} className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.city ? 'border-red-500' : ''}`} />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">CAP</label>
                    <input ref={node => { postalCodeRef.current = node; if (errors.postalCode) errorRef.current = node; }} type="text" name="postalCode" value={addressData.postalCode} className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.postalCode ? 'border-red-500' : ''}`} />
                    {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Provincia</label>
                <input ref={node => { countryRef.current = node; if (errors.country) errorRef.current = node; }} type="text" name="country" value={addressData.country} className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.country ? 'border-red-500' : ''}`} />
                {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
            </div>
        </div>
    );
};

export default AddressForm;