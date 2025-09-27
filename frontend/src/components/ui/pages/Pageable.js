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


    const fetchContent = async (page = 0, size = 10) => {
        const {data} = await axios.get(endpoint, {
            params: {page, size}
        });
        return data;
    }

    const {data: pagedData, isLoading: isLoading, error: isError} = useQuery({
        queryKey: [`content-${id}`, user.id, page],
        queryFn: () => fetchContent(page),
        keepPreviousData: true, // Utile per non mostrare uno stato di caricamento durante il cambio pagina
    });

    if (isLoading) {
        return <div className="text-center text-gray-500">Loading content...</div>;
    }

    if (isError) {
        return <div className="text-center text-red-500">Error loading page content. Please try again later.</div>;
    }

    const content = pagedData?.content || [];

    console.log(pagedData);

    return (
        content.length === 0 ? (
            <div>
                {noneFound}
            </div>
        ) : (
            <div>
                {foundMessage}

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
                    {content.map((indirizzo) => (
                        <tr key={indirizzo.id}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => onRowClick && onRowClick(indirizzo)}>

                            {columns.map((col) => (
                                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                                    {console.log(indirizzo[col.value])}
                                    {col.function(indirizzo[col.value])}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={() => setPage(old => Math.max(old - 1, 0))}
                        disabled={pagedData?.first}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Previous
                    </button>

                    <span>
                            Page {pagedData ? pagedData.number + 1 : 0} of {pagedData?.totalPages}
                        </span>

                    <button
                        onClick={() => setPage(old => (pagedData && !pagedData.last ? old + 1 : old))}
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