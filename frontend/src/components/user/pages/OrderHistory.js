import React from 'react';
import {useNavigate} from "react-router-dom";
import Pageable from "../../ui/pages/Pageable";
import {usePageTitle} from "../../utils/usePageTitle";

const OrderHistory = () => {
    const navigate = useNavigate();

    usePageTitle('Order History');

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Order History</h2>

            <Pageable endpoint={`/api/ordini/all`}
                      id={"orders"}

                      columns={[
                          {key: 'Order #', value: 'id', function: (id) => `#${id}`},
                          {
                              key: 'Date',
                              value: 'dataCreazione',
                              function: (dataCreazione) => new Date(dataCreazione).toLocaleString()
                          },
                          {
                              key: 'Total',
                              value: 'prezzoFinale',
                              function: (prezzoFinale) => `€ ${prezzoFinale}`
                          },
                          {
                              key: 'Status',
                              value: 'statoName',
                              function: (statoName) => (
                                  <div className="bg-gray-300 p-2 rounded-md text-center">{statoName}</div>
                              )
                          },
                      ]}

                      onRowClick={(order) => navigate(`/ordine/${order.id}`)}

                      noneFound={<div className="text-center text-gray-500">
                          <p>No orders found.</p>
                          <p>Start shopping to see your orders here!</p>
                      </div>}

                      foundMessage={<div>
                          <p>Questi sono gli ordini che hai effettuato.</p>
                          <p>Clicca su un ordine per visualizzarne i dettagli.</p>
                      </div>}
            />
        </div>
    );
};

export default OrderHistory;