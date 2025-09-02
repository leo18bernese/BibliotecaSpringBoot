// src/components/BookInfoTabs.js
import React, { useState, useEffect } from 'react';

const TabPanel = ({ children, value, index }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
        >
            {value === index && <div>{children}</div>}
        </div>
    );
};

const BookInfoTabs = ({ book }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);

    const handleTabChange = (index) => {
        setActiveTab(index);
    };

    // Set default variant when book data is loaded
    useEffect(() => {
        if (book && book.varianti && book.varianti.length > 0 && !selectedVariant) {
            setSelectedVariant(book.varianti[0]);
        }
    }, [book, selectedVariant]);

    const tabs = [
        { label: 'Info Produttore' },
        { label: 'Specifiche Tecniche' },
        { label: 'Prodotti Correlati' },
    ];

    const tableContent = (key, value) => {
        const id = key.replace(/\s+/g, '-').toLowerCase();
        return (
            <tr key={id} className="text-gray-700">
                <td className="border-y border-gray-300 px-4 py-1 font-semibold w-1/2">{key}</td>
                <td className="border-y border-gray-300 px-4 py-1 w-1/2">{value || 'N/A'}</td>
            </tr>
        );
    };

    return (
        <div>
            <div className="flex border-b border-gray-200 mb-6">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`px-4 py-2 ${activeTab === index ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
                        onClick={() => handleTabChange(index)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <TabPanel value={activeTab} index={0}>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Informazioni sull'Autore: {book.autore.nome}</h3>
                    <div
                        dangerouslySetInnerHTML={{ __html: book.autore.descrizione || 'Nessuna descrizione disponibile.' }}
                        className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-gray-500 prose-blockquote:bg-gray-100 prose-blockquote:p-2"
                    />
                </div>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Specifiche Tecniche</h3>
                    <div className="mb-4">
                        <label htmlFor="variant" className="block text-sm font-medium text-gray-700 mb-2">
                            Seleziona variante:
                        </label>
                        <select
                            id="variant"
                            value={selectedVariant?.id || ''}
                            onChange={(e) => {
                                const variant = book.varianti.find((v) => v.id === Number(e.target.value));
                                setSelectedVariant(variant);
                            }}
                            className="block w-full p-2 border border-gray-300 rounded-lg"
                        >
                            {book.varianti && book.varianti.length > 0 ? (
                                book.varianti.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                        {variant.nome}
                                    </option>
                                ))
                            ) : (
                                <option value="">Nessuna variante disponibile</option>
                            )}
                        </select>
                    </div>
                    <div className="flex justify-between">
                        <div className="w-2/5">
                            <p className="text-gray-700 mb-4">Caratteristiche del prodotto.</p>
                            <table>
                                <tbody>
                                {book.descrizione.caratteristiche &&
                                    Object.entries(book.descrizione.caratteristiche).map(([key, value]) =>
                                        tableContent(key, value)
                                    )}
                                {selectedVariant?.attributiSpecifici &&
                                    Object.entries(selectedVariant.attributiSpecifici).map(([key, value]) =>
                                        tableContent(key, value)
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="w-2/5">
                            <p className="text-gray-700 mb-4">Peso e dimensioni del prodotto.</p>
                            {selectedVariant ? (
                                <table>
                                    <tbody>
                                    {tableContent('Lunghezza', selectedVariant.dimensioni.length + ' cm')}
                                    {tableContent('Larghezza', selectedVariant.dimensioni.width + ' cm')}
                                    {tableContent('Altezza', selectedVariant.dimensioni.height + ' cm')}
                                    {tableContent('Peso', selectedVariant.dimensioni.weight + ' kg')}
                                    {tableContent('Volume', selectedVariant.dimensioni.volume + ' cm³')}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500">Seleziona una variante per visualizzare le dimensioni.</p>
                            )}
                        </div>
                    </div>
                </div>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Prodotti Correlati</h3>
                    <p className="text-gray-700 mb-4">Elenco dei prodotti correlati.</p>
                </div>
            </TabPanel>
        </div>
    );
};

export default BookInfoTabs;