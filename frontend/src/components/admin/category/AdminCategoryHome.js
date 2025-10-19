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

            <button
                className="flex items-center border-2  border-green-500 px-4 py-3 rounded-md
                 bg-green-100 hover:bg-green-200 w-1/3 transition"
                onClick={() => setShowAddVariantPopup(true)}
            >

                <i className='bx bx-plus-circle text-2xl text-green-600'></i>
                <span className="ml-2 font-semibold text-green-700">
                    Aggiungi Nuova Categoria</span>

            </button>

            <CreateForm endpoint={`/api/categories/new`}
                        showAddCategoryPopup={showAddVariantPopup}
                        setShowAddCategoryPopup={setShowAddVariantPopup}
                        data={[
                            ['name', 'Nome Categoria', '', 'Name is required'],
                            ['description', 'Descrizione Categoria', '', 'Description is required'],
                            ['parentId', 'ID Categoria Parent', null, '', 'Parent ID must be a number or null']
                        ]}

            />

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