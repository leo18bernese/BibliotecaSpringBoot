import React from 'react';
import {useNavigate} from "react-router-dom";
import Pageable from "../../ui/pages/Pageable";

const ReturnsHistory = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Returns History</h2>

            <Pageable endpoint={`/api/resi/all`}
                      id={"returns"}

                      columns={[
                          {key: 'Return #', value: 'id', function: (id) => `#${id}`},
                          {
                              key: 'Date',
                              value: 'dataCreazione',
                              function: (dataCreazione) => new Date(dataCreazione).toLocaleString()
                          },
                          {
                              key: 'Status',
                              value: 'statoName',
                              function: (statoName) => (
                                  <div className="bg-gray-300 p-2 rounded-md text-center">{statoName}</div>
                              )
                          },
                      ]}

                      onRowClick={(refund) => navigate(`/reso/${refund.id}`)}

                      noneFound={<div className="text-center text-gray-500">
                          <p>No returns found.</p>
                      </div>}

                      foundMessage={<div>
                          <p>Questi sono i resi che hai richiesto.</p>
                          <p>Clicca su un reso per vederne i dettagli, inclusi gli articoli restituiti e l'ordine di
                              riferimento.</p>
                      </div>}
            />
        </div>
    );
};

export default ReturnsHistory;