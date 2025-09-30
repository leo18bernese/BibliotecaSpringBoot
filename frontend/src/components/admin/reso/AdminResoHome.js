import {useNavigate} from "react-router-dom";
import {usePageTitle} from "../../utils/usePageTitle";
import Pageable from "../../ui/pages/Pageable";

const AdminResoHome = () => {
    const navigate = useNavigate();

    usePageTitle('Admin Home - Resi');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - Resi List</h1>

            <Pageable endpoint={`/api/admin/resi/light-all`}
                      id={"resi"}
                      columns={[
                          {key: 'ID Reso', value: 'id', function: (id) => `#${id}`},
                          {key: 'ID Ordine', value: 'ordineId'},
                          {key: 'Numero Articoli', value: 'itemsCount'},
                          {key: 'Stato', value: 'statoCorrente', function: (stato) => stato ?? '-'},
                      ]}
                      onRowClick={(reso) => navigate(`/admin/reso/${reso.id}`)}
                      noneFound={<div className="text-center text-gray-500">
                          <p>Nessun reso presente.</p>
                          <p>Non ci sono resi nel sistema.</p>
                      </div>}
                      foundMessage={<div>
                          <p>Questi sono i resi registrati nel sistema.</p>
                          <p>Clicca su un reso per gestirne i dettagli.</p>
                      </div>}
            />
        </div>
    );
}

export default AdminResoHome;