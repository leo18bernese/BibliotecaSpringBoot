import React, {useEffect, useState} from 'react';

const CategoryForm = ({categoryData, handleChange, errors, errorRef}) => {

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome Variante</label>
                <input
                    type="text"
                    name="nome"
                    value={categoryData.nome}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.nome ? 'border-red-500' : ''}`}
                    ref={node => {
                        if (errors.nome) errorRef.current = node;
                    }}
                />
                {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Descrizione Variante</label>
                <input
                    type="text"
                    name="descrizione"
                    value={categoryData.descrizione}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.descrizione ? 'border-red-500' : ''}`}
                    ref={node => {
                        if (errors.descrizione) errorRef.current = node;
                    }}
                />
                {errors.descrizione && <p className="text-red-500 text-sm">{errors.descrizione}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Categoria Parent</label>
                <input
                    type="text"
                    name="parentId"
                    value={categoryData.parentId || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors.parentId ? 'border-red-500' : ''}`}
                    ref={node => {
                        if (errors.parentId) errorRef.current = node;
                    }}
                />
                {errors.parentId && <p className="text-red-500 text-sm">{errors.parentId}</p>}
            </div>
        </div>


    );
};

export default CategoryForm;
