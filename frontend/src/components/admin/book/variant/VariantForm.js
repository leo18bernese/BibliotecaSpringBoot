import React, {useEffect, useState} from 'react';

const VariantForm = ({variantData, handleChange, errors, errorRef}) => {
    const [dimension, setDimension] = useState({
        length: '',
        width: '',
        height: '',
        weight: ''
    });

    useEffect(() => {
        setDimension(variantData.dimensioni || {length: '', width: '', height: '', weight: ''});
    }, [variantData]);

    const handleDimensionChange = (e) => {
        const {name, value} = e.target;
        const updated = {...dimension, [name]: value};
        setDimension(updated);
        handleChange({target: {name: 'dimensioni', value: updated}});
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome Variante</label>
                <input
                    type="text"
                    name="nome"
                    value={variantData.nome}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.nome ? 'border-red-500' : ''}`}
                    ref={node => {
                        if (errors.nome) errorRef.current = node;
                    }}
                />
                {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Dimensioni (cm)</label>
                <div className="grid grid-cols-3 gap-2">
                    <input
                        type="number"
                        name="length"
                        value={dimension.length}
                        onChange={handleDimensionChange}
                        placeholder="Larghezza"
                        className="mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2"
                    />
                    <input
                        type="number"
                        name="height"
                        value={dimension.height}
                        onChange={handleDimensionChange}
                        placeholder="Altezza"
                        className="mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2"
                    />
                    <input
                        type="number"
                        name="width"
                        value={dimension.width}
                        onChange={handleDimensionChange}
                        placeholder="Profondità"
                        className="mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2"
                    />
                    <input
                        type="number"
                        name="weight"
                        value={dimension.weight}
                        onChange={handleDimensionChange}
                        placeholder="Peso (kg)"
                        className="mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 col-span-3"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Prezzo (€)</label>
                <input
                    type="number"
                    name="prezzo"
                    value={variantData.prezzo}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.prezzo ? 'border-red-500' : ''}`}
                />
                {errors.prezzo && <p className="text-red-500 text-sm">{errors.prezzo}</p>}
            </div>
        </div>
    );
};

export default VariantForm;
