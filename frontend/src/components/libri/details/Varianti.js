import React, {useEffect, useState} from "react";

const Varianti = ({varianti, onSelect, selected}) => {
    const [alberoVarianti, setAlberoVarianti] = useState({});
    const [selectedPath, setSelectedPath] = useState("");

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

    const renderVarianteCard = (variante) => (
        <div key={variante.id} className={` p-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500
            transition-colors shadow-sm hover:shadow-md ` + (variante.id === selected.id ? 'bg-blue-100 ' : 'bg-gray-100 ')}
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
            className={`bg-white p-3 border-2 rounded-lg cursor-pointer transition-colors
             ${selectedPath.startsWith(path) && (selectedPath.length > path.length) ? 'border-blue-500 shadow-md' : 'border-gray-300 hover:border-gray-400'}`}
            onClick={() => setSelectedPath(path)}
        >
            <div className="flex justify-between items-center">
                <div>
                    {/*<span className="text-xs font-medium text-gray-500 capitalize">{nodo.tipo}</span>*/}
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

    if (!varianti || varianti.length <= 1) {
        return null;
    }

    return (
        <div className="my-2">
            <h2 className="text-lg font-semibold">Varianti disponibili</h2>
            {renderAllLevels(alberoVarianti)}
        </div>
    );
};

export default Varianti;