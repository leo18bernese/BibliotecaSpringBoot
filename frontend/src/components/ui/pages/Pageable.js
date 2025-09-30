import axios from "axios";
import React, {useContext, useState} from "react";
import {UserContext} from "../../user/UserContext";
import {useQuery} from "@tanstack/react-query";

const Pageable = ({
                      id, endpoint, columns,
                      noneFound, foundMessage,
                      onRowClick
                  }) => {

    const {user} = useContext(UserContext);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [inputPage, setInputPage] = useState(1);

    const fetchContent = async (page = 0, size = 10) => {
        const {data} = await axios.get(endpoint, {
            params: {page, size}
        });
        return data;
    }

    const {data: pagedData, isLoading: isLoading, error: isError} = useQuery({
        queryKey: [`content-${id}`, user.id, page, size],
        queryFn: () => fetchContent(page, size),
        keepPreviousData: true, // Utile per non mostrare uno stato di caricamento durante il cambio pagina
    });

    if (isLoading) {
        return <div className="text-center text-gray-500">Loading content...</div>;
    }

    if (isError) {
        return <div className="text-center text-red-500">Error loading page content. Please try again later.</div>;
    }

    if(!pagedData.pageable ) {
        return <div className="text-center text-red-500">Error for developer: pageable missing in response, make sure
            backend is returning a Page object.</div>;
    }

    console.log(pagedData);

    const content = pagedData?.content || [];
    const totalPages = pagedData?.totalPages || 1;

    return (

        content.length === 0 ? (
            <div>
                {noneFound}
            </div>
        ) : (
            <div>
                {foundMessage}

                <div className="flex items-center gap-2">
                    Items per pagina:
                    <select
                        className="border rounded px-2 py-1"
                        value={size}
                        onChange={e => {
                            setSize(Number(e.target.value));
                            setPage(0);
                            setInputPage(1);
                        }}
                    >
                        {[5, 10, 20, 50].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <table className="min-w-full divide-y divide-gray-200 mt-8">
                    <thead className="bg-gray-200">
                    <tr>
                        {columns.map((col) => (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {col.key}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                    {content.map((row) => (
                        <tr key={row.id}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => onRowClick && onRowClick(row)}>

                            {columns.map((col) => (
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                                    {col.function ?
                                        (col.value ?
                                                col.function(row[col.value]) :
                                                col.function(row)
                                        ) :
                                        (row[col.value])
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={() => {
                            setPage(old => Math.max(old - 1, 0));
                            setInputPage(old => Math.max(old - 1, 0) + 1);
                        }}
                        disabled={pagedData?.first}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Previous
                    </button>

                    {/* CENTRO: selettore items per pagina e input pagina */}
                    <div className="flex flex-col items-center gap-1">


                        <label className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={inputPage}
                                onChange={e => {
                                    let val = Number(e.target.value);
                                    if (val < 1) val = 1;
                                    if (val > totalPages) val = totalPages;
                                    setInputPage(val);
                                }}
                                onBlur={() => setPage(inputPage - 1)}
                                className="border rounded text-center no-spinner bg-gray-200 text-lg"
                                style={{width: `${String(totalPages).length + 4}ch`, MozAppearance: 'textfield'}}
                            />

                            <span>/ {totalPages}</span>
                        </label>
                    </div>


                    <button
                        onClick={() => {
                            setPage(old => (pagedData && !pagedData.last ? old + 1 : old));
                            setInputPage(old => (pagedData && !pagedData.last ? old + 2 : old));
                        }}
                        disabled={pagedData?.last}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Next
                    </button>
                </div>
            </div>
        )
    );
}

export default Pageable;
