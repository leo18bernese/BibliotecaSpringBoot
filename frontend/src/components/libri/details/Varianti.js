import React, {useEffect, useState} from "react";

const Varianti = ({varianti, onSelect, selected}) => {
    const [alberoVarianti, setAlberoVarianti] = useState({});
    const [selectedPath, setSelectedPath] = useState("");
    const [selectedVariantPath, setSelectedVariantPath] = useState("");

    const updateOrResetPath = (newPath, isLeaf = false, isSubNodeLeaf = false) => {
        console.log("updateOrResetPath", {newPath, isLeaf, isSubNodeLeaf, selectedPath});

        if (isLeaf) {

            if (newPath !== selectedPath) {
                setSelectedPath(newPath);
            }
            return;
        }


        if (selectedPath === newPath) {
            setSelectedPath(newPath.split('.').slice(0, -1).join('.'));
            console.log("Reset selectedPath to parent:", newPath.split('.').slice(0, -1).join('.'));
        } else {
            setSelectedPath(newPath);
            console.log("Set selectedPath to:", newPath);
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
        //console.log("Albero delle varianti:", albero);
        return albero;
    };

    // Funzione per costruire il percorso della variante selezionata
    const costruisciSelectedPath = (variante) => {
        if (!variante || !variante.attributiSpecifici) return "";
        const chiavi = Object.keys(variante.attributiSpecifici).sort();
        return chiavi.map(chiave => variante.attributiSpecifici[chiave]).join('.');
    };

    const renderVarianteCard = (variante) => {
        //console.log("variante", variante.nome);

        return <div
            key={variante.id}
            className={` p-2 border-2 rounded-lg cursor-pointer flex flex-col justify-between
        transition-colors shadow-sm ` +
                (variante.id === selected.id ? 'bg-blue-100 border-blue-300' : 'bg-gray-100  border-gray-300  hover:border-blue-500 hover:shadow-md ')}
            onClick={() => {
                if (onSelect) onSelect(variante);
            }}>

            <h4 className="font-semibold text-sm mb-2">{variante.dynamicName}</h4>

            <div className="space-y-1">

                {variante.prezzo.sconto && (variante.prezzo.sconto.percentuale > 0 || variante.prezzo.sconto.valore > 0) && (
                    <span className="text-sm text-gray-500 line-through">
                        {variante.prezzo.prezzo.toFixed(2)} €
                    </span>
                )}

                <br/>

                <span className="text-lg font-bold text-blue-600">
                    {variante.prezzo.prezzoTotale.toFixed(2)} €
                </span>

                <p className="text-xs " style={{color: variante.rifornimento.color}}>{variante.rifornimento.status}</p>
            </div>
        </div>
    };

    const renderNodoCard = (nodo, path) => {

        const figliLength = Object.keys(nodo.figli).length + nodo.varianti.length;

        return <div
            key={path}
            className={` p-3 border-2 rounded-lg cursor-pointer transition-colors
         ${selectedVariantPath.startsWith(path) ? ' bg-blue-100 shadow-md' : `bg-white hover:${selectedPath === path ? 'border-blue-500' : 'border-gray-400'}`}
            ${selectedPath === path ? 'border-blue-500 shadow-lg' : 'border-gray-300 '}
          `}
            onClick={() => {
                // Determina se è una leaf principale o di sub-nodo
                const isLeaf = Object.keys(nodo.figli).length === 0;
                const isSubNodeLeaf = path.includes('.') && isLeaf;
                updateOrResetPath(path, isLeaf, isSubNodeLeaf);
            }}
        >
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold capitalize text-lg mt-1">{nodo.nome}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                        {figliLength} {figliLength === 1 ? 'opzione' : 'opzioni'}
                    </p>
                </div>
            </div>
        </div>
    };

    const renderAllLevels = (nodi, currentPath = "", depth = 0, isSubVar = false) => {
        if (!nodi || Object.keys(nodi).length === 0) return null;

        const firstNodeType = Object.keys(nodi).length > 0 ? nodi[Object.keys(nodi)[0]].tipo : null;
        const currentLevelTitle = isSubVar ? "Altre opzioni" : firstNodeType ? `Seleziona ${firstNodeType}:` : "Seleziona opzione:";

        return (
            <div key={currentPath} className="mt-4">
                {/*depth > 0 &&*/ (
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                        {currentLevelTitle}
                    </h3>
                )}

                <div className="flex flex-wrap items-stretch gap-4">
                    {Object.entries(nodi).map(([chiave, nodo]) => {
                        const nuovoPath = currentPath ? `${currentPath}.${chiave}` : chiave;
                        const isLeaf = !isSubVar ? (Object.keys(nodo.figli).length) === 0 : true;
                        const isOnlyVariant = !isSubVar ? (Object.keys(nodo.figli).length === 0 && nodo.varianti.length > 1) : true;

                        //console.log("Rendering node:", nodo);

                        if (isSubVar) {
                            return renderVarianteCard(nodo);
                        }

                        if (isOnlyVariant) {
                            return renderNodoCard(nodo, nuovoPath);
                        }

                        if (isLeaf) {
                            return (
                                <div key={nuovoPath} className="contents">
                                    {nodo.varianti.map((variante) => {
                                        const isLeaf = true;
                                        const isSubNodeLeaf = currentPath.includes('.');
                                        return (
                                            <div
                                                key={variante.id}
                                                onClick={() => updateOrResetPath(currentPath, isLeaf, isSubNodeLeaf)}
                                            >
                                                {renderVarianteCard(variante)}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        } else {
                            //console.log("node", nodo);
                            return renderNodoCard(nodo, nuovoPath);
                        }
                    })}
                </div>

                {!isSubVar && (
                    Object.entries(nodi).map(([chiave, nodo]) => {
                        const nuovoPath = currentPath ? `${currentPath}.${chiave}` : chiave;

                        //console.log("selectedPath", selectedPath);

                        if (selectedPath.startsWith(nuovoPath)) {
                            return (
                                <div key={`figli-${nuovoPath}`}>
                                    {renderAllLevels(nodo.figli, nuovoPath, depth + 1)}

                                    {renderAllLevels(nodo.varianti, nuovoPath, depth + 1, isSubVar = true)}
                                </div>
                            );
                        }
                        return null;
                    })
                )}
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