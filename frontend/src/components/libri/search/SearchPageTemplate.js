import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
import MetadataDisplay from "./MetadataDisplay";
import BookDisplay from "../BookDisplay";

function SearchPageTemplate({initSearchParams, endpoint = '/api/libri/ricerca'}) {
    const location = useLocation();
    const navigate = useNavigate();

    // Stato per i parametri di ricerca nell'URL
    const [searchParams, setSearchParams] = useState(() => (initSearchParams || new URLSearchParams(location.search)));

    const [libri, setLibri] = useState([]);
    const [loadingResults, setLoadingResults] = useState(true);
    const [error, setError] = useState(null);

    console.log("SearchPageTemplate rendered with searchParams:", searchParams, initSearchParams);

    const [pagination, setPagination] = useState({
        page: parseInt(searchParams.get('pagina') || '0', 10),
        size: parseInt(searchParams.get('elementiPerPagina') || '10', 10),
        totalPages: 0,
        totalElements: 0,
    });

    // Filtri dall'API
    const [contextualFilters, setContextualFilters] = useState({});
    // Filtri stabili per l'UI
    const [stableFilters, setStableFilters] = useState({});
    const [shownFilters, setShownFilters] = useState({});

    // Funzione per aggiornare i parametri di ricerca e navigare
    const updateSearchParams = (newParams) => {
        setSearchParams(newParams);
        navigate({search: newParams.toString()}, {replace: true});
    };

    // Effetto per recuperare i dati quando i parametri di ricerca cambiano
    useEffect(() => {
        const fetchLibriAndContextualFilters = async () => {
            setLoadingResults(true);
            setError(null);
            try {
                const response = await axios.get(`/api/libri/ricerca?${searchParams.toString()}`);
                const {libri: libriData, filtriDisponibili} = response.data;

                console.log(response.data);

                setLibri(libriData.content);
                setPagination(prev => ({
                    ...prev,
                    totalPages: libriData.totalPages,
                    totalElements: libriData.totalElements,
                }));

                setContextualFilters(filtriDisponibili);
            } catch (err) {
                setError('Errore durante il recupero dei dati.');
                console.error(err);
            } finally {
                setLoadingResults(false);
            }
        };

        fetchLibriAndContextualFilters();
    }, [searchParams]);

    // Effetto per aggiornare i filtri stabili quando arrivano nuovi dati dall'API
    useEffect(() => {
        setStableFilters(prevStableFilters => {
            const newStableFilters = {...prevStableFilters};
            for (const type in contextualFilters) {
                if (!newStableFilters[type]) {
                    newStableFilters[type] = [];
                }
                const stableOptions = new Map(newStableFilters[type].map(opt => [opt.valore, opt]));
                const contextOptions = new Map(contextualFilters[type].map(opt => [opt.valore, opt]));

                stableOptions.forEach((stableOpt, valore) => {
                    const contextOpt = contextOptions.get(valore);
                    stableOpt.conteggio = contextOpt ? contextOpt.conteggio : 0;
                });

                contextOptions.forEach((contextOpt, valore) => {
                    if (!stableOptions.has(valore)) {
                        stableOptions.set(valore, contextOpt);
                    }
                });
                newStableFilters[type] = Array.from(stableOptions.values());
            }
            return newStableFilters;
        });
    }, [contextualFilters]);

    // Gestori di eventi per modificare i filtri
    const handleFilterChange = (key, value, resetPage = true) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        if (resetPage) {
            newParams.set('pagina', '0');
        }
        updateSearchParams(newParams);
    };

    const handleEnterKey = (e, key) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const value = e.target.value.trim();

            if (value) {
                handleFilterChange(key, value);
            } else {
                handleFilterChange(key, null);
            }
        }
    };

    const handleCharacteristicChange = (caratteristicaNome, valore) => {
        const newParams = new URLSearchParams(searchParams);
        const currentValues = newParams.get(caratteristicaNome)?.split(',') || [];
        const valueIndex = currentValues.indexOf(valore);

        if (valueIndex > -1) {
            currentValues.splice(valueIndex, 1);
        } else {
            currentValues.push(valore);
        }

        if (currentValues.length === 0) {
            newParams.delete(caratteristicaNome);
        } else {
            newParams.set(caratteristicaNome, currentValues.join(','));
        }
        newParams.set('pagina', '0');
        updateSearchParams(newParams);
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({...prev, page: newPage}));
        handleFilterChange('pagina', newPage, false);
    };

    const handleSizeChange = (newSize) => {
        setPagination(prev => ({...prev, size: newSize}));
        handleFilterChange('elementiPerPagina', newSize, true);
    };

    const availableCharacteristicTypes = Object.keys(stableFilters);


    return (
        <div className="flex items-start">
            {/* Sidebar dei Filtri */}
            <div className="w-1/4 p-5 mr-4 bg-white self-start">
                <h2 className="font-semibold text-xl text-gray-700">FILTRI</h2>

                {loadingResults && Object.keys(stableFilters).length === 0 && <p>Caricamento filtri...</p>}
                {Object.keys(stableFilters).length === 0 && !loadingResults ? (
                    <p>Nessun filtro disponibile.</p>
                ) : (
                    <>
                        <div className="bg-gray-200 p-4 rounded-lg mb-4">
                            <h3 className="text-lg font-semibold">Items per Pagina</h3>
                            <div className="flex flex-col space-y-2">
                                <input
                                    id="itemsPerPageSlider"
                                    type="range"
                                    min="2" max="100"
                                    value={pagination.size}
                                    onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                    aria-label="Items per page slider"
                                />

                                <label htmlFor="itemsPerPageSlider"
                                       className="text-gray-600">Attualmente: {pagination.size} elementi per
                                    pagina</label>
                            </div>
                        </div>

                        <div className="bg-gray-200 p-4 rounded-lg mb-4">
                            <h3 className="text-lg font-semibold">Prezzo</h3>
                            <div className="flex flex-col space-y-2">
                                <input type="number" className="p-2 rounded-md" placeholder="Min"
                                       defaultValue={searchParams.get('prezzoMin') || ''}
                                       onBlur={(e) => handleFilterChange('prezzoMin', e.target.value)}/>

                                <input type="number" className="p-2 rounded-md" placeholder="Max"
                                       defaultValue={searchParams.get('prezzoMax') || ''}
                                       onBlur={(e) => handleFilterChange('prezzoMax', e.target.value)}/>
                            </div>
                        </div>

                        <h3 className="font-semibold text-xl text-gray-700">ALTRI FILTRI</h3>
                        {availableCharacteristicTypes.map(type => (

                            <div key={type} className="border-t border-gray-200 py-2">
                                <div className="flex items-center justify-between">

                                    <div
                                        className="text-lg font-semibold text-gray-500">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                                    <button
                                        className="text-gray-700 focus:outline-none"
                                        onClick={() => setShownFilters(prev => ({...prev, [type]: !prev[type]}))}
                                        aria-label={shownFilters[type] ? "Collapse filter options" : "Expand filter options"}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d={shownFilters[type] ? "M18 12H6" : "M12 6v12m6-6H6"}/>
                                        </svg>
                                    </button>
                                </div>

                                {shownFilters[type] && (
                                    stableFilters[type]?.map(option => {
                                        const isSelected = searchParams.get(type)?.split(',').includes(option.valore) || false;

                                        if (option.conteggio > 0 || isSelected) {
                                            return (
                                                <div key={option.valore} className="flex items-center mb-2">

                                                    <input
                                                        type="checkbox"
                                                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        id={`${type}-${option.valore}`}
                                                        checked={isSelected}
                                                        onChange={() => handleCharacteristicChange(type, option.valore)}
                                                    />

                                                    <MetadataDisplay metadata={option.metadata} tipo={type}/>


                                                    <label
                                                        htmlFor={`${type}-${option.valore}`}>{option.valore} ({option.conteggio})</label>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Area Principale dei Risultati */}
            <div className="w-3/4 px-5">

                <input
                    type="text"
                    placeholder="Cerca per titolo o descrizione..."
                    defaultValue={searchParams.get('q') || ''}
                    onBlur={(e) => handleFilterChange('q', e.target.value)}
                    onKeyDown={(e) => handleEnterKey(e, 'q')}
                    style={{width: '100%', padding: '10px', marginBottom: '20px'}}
                />

                {/*<h2 className="text-lg  mb-4">
                    Risultati per la ricerca: <span
                    className="font-semibold">{searchParams.get('q') || "non disponibile"}</span>
                </h2>*/}

                <BookDisplay contentList={libri} loadingResults={loadingResults} error={error}/>

                {libri.length > 0 && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-8">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 0}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            Precedente
                        </button>
                        <span className="text-lg">
                            Pagina {pagination.page + 1} di {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages - 1}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            Successiva
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchPageTemplate;