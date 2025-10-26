import {useNavigate} from "react-router-dom";
import {usePageTitle} from "../../utils/usePageTitle";
import Pageable from "../../ui/pages/Pageable";
import React, {useState} from "react";
import CreateForm from "./create/CreateForm";

const AdminCategoryHome = () => {
    const navigate = useNavigate();

    const [showAddVariantPopup, setShowAddVariantPopup] = useState(false);

    usePageTitle('Admin Home - Categories');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - Category List</h1>

            <CreateForm endpoint={`/api/admin/category`}
                        showAddMessage={"Aggiungi Nuova Categoria"}
                        data={[
                            ['name', 'Nome Categoria', '', 'Name is required', false, 'text'],
                            ['description', 'Descrizione Categoria', '', 'Description is required', false, 'text'],
                            ['parentId', 'ID Categoria Parent', null, 'Parent ID must be a number or null', true, 'number']
                        ]}

            />

            <Pageable endpoint={`/api/admin/category/light-all`}
                      id={"books"}
                      columns={[
                          {key: 'ID', value: 'id', function: (id) => `#${id}`},
                          {key: 'Name', value: 'name'},
                          {key: 'Has Parent', value: 'parentId', function: (parent) => parent ? ("#" + parent) : '/'},
                          {key: 'Description', value: 'description'},
                          {key: 'Updated At', value: 'updatedAt', function: (date) => new Date(date).toLocaleString()}
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
                          <p>Clicca su una categoria per gestirne i dettagli.</p>
                      </div>}
                      compactLevel={1}
            />
        </div>
    );
}

export default AdminCategoryHome;