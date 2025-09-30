import {useNavigate} from "react-router-dom";
import {usePageTitle} from "../../utils/usePageTitle";
import Pageable from "../../ui/pages/Pageable";

const AdminBookHome = () => {
    const navigate = useNavigate();

    usePageTitle('Admin Home - Libri');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - Book List</h1>

            <Pageable endpoint={`/api/admin/libri/light-all`}
                      id={"books"}
                      columns={[
                          {key: 'ID', value: 'id', function: (id) => `#${id}`},
                          {key: 'Title', value: 'name'},
                          {key: 'Author', value: 'author'},
                          {key: 'Isbn', value: 'isbn'},
                          {key: 'Variants', value: 'variants'},
                      ]}
                      onRowClick={(book) => navigate(`/admin/book/${book.id}`)}
                      noneFound={<div className="text-center text-gray-500">
                          <p>Nessun libro presente.</p>
                          <p>Non ci sono libri nel sistema.</p>
                      </div>}
                      foundMessage={<div>
                          <p>Questi sono i libri registrati nel sistema.</p>
                          <p>Clicca su un libro per gestirne i dettagli.</p>
                      </div>}
            />
        </div>
    );
}

export default AdminBookHome;