import React, {useEffect, useState} from "react";

const Varianti = ({varianti, onSelect, selected}) => {
    const [alberoVarianti, setAlberoVarianti] = useState({});
    const [selectedPath, setSelectedPath] = useState("");
    const [selectedVariantPath, setSelectedVariantPath] = useState("");

    const updateOrResetPath = (newPath) => {
        if (selectedPath === newPath) {
            setSelectedPath("");
        } else {
            setSelectedPath(newPath);
        }
    };

    // Funzione per costruire l'albero delle varianti
    const costruisciAlbero = (varianti) => {
        const albero = {};
        varianti.forEach((variante) => {
            const attr = variante.attributiSpecifici;
            if (!attr) return;
            const chiavi = Object.keys(attr).sort();
            let nodoCorrente = albero;

            chiavi.forEach((chiave, index) => {
                const valore = attr[chiave];
                if (!nodoCorrente[valore]) {
                    nodoCorrente[valore] = {
                        nome: valore,
                        tipo: chiave,
                        figli: {},
                        varianti: [], // Ora è un array
                    };
                }
                if (index === chiavi.length - 1) {
                    nodoCorrente[valore].varianti.push(variante);
                } else {
                    nodoCorrente = nodoCorrente[valore].figli;
                }
            });
        });
        return albero;
    };

    // Funzione per costruire il percorso della variante selezionata
    const costruisciSelectedPath = (variante) => {
        if (!variante || !variante.attributiSpecifici) return "";
        const chiavi = Object.keys(variante.attributiSpecifici).sort();
        return chiavi.map(chiave => variante.attributiSpecifici[chiave]).join('.');
    };

    const renderVarianteCard = (variante) => (
        <div key={variante.id} className={` p-2 border-2 rounded-lg cursor-pointer 
            transition-colors shadow-sm ` +
            (variante.id === selected.id ? 'bg-blue-100 border-blue-300' : 'bg-gray-100  border-gray-300  hover:border-blue-500 hover:shadow-md ')}
             onClick={() => {
                 if (onSelect) onSelect(variante);
             }}>

            <h4 className="font-semibold text-sm mb-2">{variante.nome}</h4>

            <div className="space-y-1">

                {(variante.prezzo.sconto.percentuale > 0 || variante.prezzo.sconto.valore > 0) && (
                    <span className="text-sm text-gray-500 line-through">
                        {variante.prezzo.prezzo.toFixed(2)} €
                    </span>
                )}

                <span className="text-lg font-bold text-blue-600">
                    {variante.prezzo.prezzoTotale.toFixed(2)} €
                </span>


                <p className="text-xs text-green-600">{variante.rifornimento.status}</p>
            </div>
        </div>
    );

    const renderNodoCard = (nodo, path) => (
        <div
            key={path}
            className={` p-3 border-2 rounded-lg cursor-pointer transition-colors
         ${selectedVariantPath.startsWith(path) ? ' bg-blue-100 shadow-md' : 'bg-white hover:border-gray-400'}
            ${selectedPath === path ? 'border-blue-500 shadow-lg' : 'border-gray-300 '}
          `}
            onClick={() => updateOrResetPath(path)}
        >
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold capitalize text-lg mt-1">{nodo.nome}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                        {Object.keys(nodo.figli).length} {Object.keys(nodo.figli).length === 1 ? 'opzione' : 'opzioni'}
                    </p>
                </div>
            </div>
        </div>
    );

    const renderAllLevels = (nodi, currentPath = "", depth = 0) => {
        if (!nodi || Object.keys(nodi).length === 0) return null;

        const firstNodeType = Object.keys(nodi).length > 0 ? nodi[Object.keys(nodi)[0]].tipo : null;
        const currentLevelTitle = firstNodeType ? `Seleziona ${firstNodeType}:` : "Seleziona opzione:";

        return (
            <div key={currentPath} className="mt-4">
                {depth > 0 && (
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                        {currentLevelTitle}
                    </h3>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {Object.entries(nodi).map(([chiave, nodo]) => {
                        const nuovoPath = currentPath ? `${currentPath}.${chiave}` : chiave;
                        const isLeaf = Object.keys(nodo.figli).length === 0;

                        if (isLeaf) {
                            return (
                                <div key={nuovoPath} className="contents">
                                    {nodo.varianti.map((variante) => renderVarianteCard(variante))}
                                </div>
                            );
                        } else {
                            return renderNodoCard(nodo, nuovoPath);
                        }
                    })}
                </div>

                {Object.entries(nodi).map(([chiave, nodo]) => {
                    const nuovoPath = currentPath ? `${currentPath}.${chiave}` : chiave;
                    if (selectedPath.startsWith(nuovoPath) && Object.keys(nodo.figli).length > 0) {
                        return (
                            <div key={`figli-${nuovoPath}`}>
                                {renderAllLevels(nodo.figli, nuovoPath, depth + 1)}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    };

    useEffect(() => {
        if (varianti && varianti.length > 0) {
            setAlberoVarianti(costruisciAlbero(varianti));
        }
    }, [varianti]);

    useEffect(() => {
        if (selected) {
            setSelectedVariantPath(costruisciSelectedPath(selected));
        }
    }, [selected]);

    if (!varianti || varianti.length <= 1) {
        return null;
    }

    return (
        <div className="my-2">
            <h2 className="text-lg font-semibold">Varianti disponibili</h2>
            {selected && selected.nome && (
                <p className="text-sm text-gray-600 mb-4">
                    Variante selezionata: <strong className="font-medium">{selected.nome}</strong>
                </p>
            )}
            {renderAllLevels(alberoVarianti)}
        </div>
    );
};

export default Varianti;