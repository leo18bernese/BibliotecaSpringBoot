import React, {useState} from 'react';

const TabPanel = ({children, value, index}) => {
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

const BookInfoTabs = ({book}) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (index) => {
        setActiveTab(index);
    };

    const tabs = [
        {label: 'Info Produttore'},
        {label: 'Specifiche Tecniche'},
        {label: 'Prodotti Correlati'}
    ];

    const tableContent = (index, key, value) => {
        const id = index || key.replace(/\s+/g, '-').toLowerCase();

        return (
            <tr key={id} className="text-gray-700">
                <td className="border-y border-gray-300 px-4 py-1 font-semibold w-1/2">{key}</td>
                <td className="border-y border-gray-300 px-4 py-1 w-1/2">{value}</td>
            </tr>
        );
    }

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

            <TabPanel value={activeTab} index={0}>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Informazioni sull'Autore: {book.autore.nome}</h3>

                    <div
                        dangerouslySetInnerHTML={{__html: book.descrizione.autoreHtml}}
                        className="prose proselg max-w-none
                        prose-headings:text-gray-800
                        prose-p:text-gray-700
                          prose-blockquote:border-l-4 prose-blockquote:border-gray-500 prose-blockquote:bg-gray-100 prose-blockquote:p-2"
                    />
                </div>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Specifiche Tecniche</h3>

                    <div className="flex justify-between ">

                        <div className="w-2/5">
                            <p className="text-gray-700 mb-4">Specifiche tecniche del prodotto.</p>

                            <table >
                                <tbody>

                                {Object.entries(book.descrizione.caratteristiche).map(([key, value], index) => (
                                    tableContent(index, key, value)
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="w-2/5">
                            <p className="text-gray-700 mb-4">Peso e dimensioni del prodotto.</p>

                            <table >
                                <tbody>

                                {tableContent(null, 'Lunghezza', book.dimensioni.length + ' cm' || 'N/A')}
                                {tableContent(null, 'Larghezza', book.dimensioni.width + ' cm' || 'N/A')}
                                {tableContent(null, 'Altezza', book.dimensioni.height + ' cm' || 'N/A')}
                                {tableContent(null, 'Peso', book.dimensioni.weight + ' kg' || 'N/A')}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Prodotti Correlati</h3>
                    <p className="text-gray-700 mb-4">Elenco dei prodotti correlati.</p>
                </div>
            </TabPanel>
        </div>
    );
};

export default BookInfoTabs;