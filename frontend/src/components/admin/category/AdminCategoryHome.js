import {useNavigate} from "react-router-dom";
import {usePageTitle} from "../../utils/usePageTitle";
import Pageable from "../../ui/pages/Pageable";

const AdminCategoryHome = () => {
    const navigate = useNavigate();

    usePageTitle('Admin Home - Categories');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - Category List</h1>

            <Pageable endpoint={`/api/admin/category/light-all`}
                      id={"books"}
                      columns={[
                          {key: 'ID', value: 'id', function: (id) => `#${id}`},
                          {key: 'Name', value: 'name'},
                          {key: 'Has Parent', value: 'hasParent', function: (hasParent) => hasParent ? 'Yes' : 'No'},
                          {key: 'Description', value: 'description'},
                      ]}
                      filterableFields={
                            [
                                {key: 'Has Parent', value: 'hasParent', type: 'boolean'},
                            ]
                      }
                      onRowClick={(book) => navigate(`/admin/category/${book.id}`)}
                      noneFound={<div className="text-center text-gray-500">
                          <p>Nessuna categoria presente.</p>
                          <p>Anomalo che non ci siano categorie nel sistema.</p>
                      </div>}
                      foundMessage={<div>
                          <p>Queste sono le categorie presenti nel sistema.</p>
                          <p>Clicca su una categoria per gestirne i dettagli.</p>
                      </div>}
            />
        </div>
    );
}

export default AdminCategoryHome;