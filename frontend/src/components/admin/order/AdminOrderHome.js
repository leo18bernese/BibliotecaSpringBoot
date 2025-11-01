import {useNavigate} from "react-router-dom";
import {usePageTitle} from "../../utils/usePageTitle";
import Pageable from "../../ui/pages/Pageable";

const AdminOrderHome = () => {
    const navigate = useNavigate();

    usePageTitle('Admin Home - Orders');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - Order List</h1>

            <Pageable endpoint={`/api/admin/order/light-all`}
                      id={"orders"}
                      columns={[
                          {key: 'ID', value: 'id', function: (id) => `#${id}`},
                          //{key: 'Utente', value: 'username'},
                          {key: 'Email', value: 'email'},
                          {
                              key: 'Data Creazione',
                              value: 'dataCreazione',
                              function: (d) => d ? new Date(d).toLocaleString() : '-'
                          },
                          //{key: 'Data Modifica', value: 'dataModifica', function: (d) => d ? new Date(d).toLocaleString() : '-'},
                          //{key: 'Somma Totale', value: 'sommaTotale', function: (v) => v?.toFixed(2) ?? '-'},
                          {key: 'Prezzo Finale', value: 'prezzoFinale', function: (v) => v?.toFixed(2) ?? '-'},
                          {key: 'Spese Spedizione', value: 'speseSpedizione', function: (v) => v?.toFixed(2) ?? '-'},
                          {key: 'Items', value: 'items'},
                          //{key: 'Coupon Usato', value: 'couponUsed', function: (c) => c ? 'Sì' : 'No'},
                          {key: 'Stato', value: 'stato', function: (s) => s ?? '-'},
                      ]}
                      onRowClick={(order) => navigate(`/admin/order/${order.id}`)}
                      noneFound={<div className="text-center text-gray-500">
                          <p>Nessun ordine presente.</p>
                          <p>Non ci sono ordini nel sistema.</p>
                      </div>}
                      foundMessage={<div>
                          <p>Questi sono gli ordini registrati nel sistema.</p>
                          <p>Clicca su un ordine per gestirne i dettagli.</p>
                      </div>}
            />
        </div>
    );
}

export default AdminOrderHome;