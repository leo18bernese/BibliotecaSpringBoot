import {useNavigate} from "react-router-dom";
import {usePageTitle} from "../../utils/usePageTitle";
import Pageable from "../../ui/pages/Pageable";


const AdminUserHome = () => {
    const navigate = useNavigate();

    usePageTitle('Admin Home - Users');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Home - User List</h1>

            <Pageable endpoint={`/api/admin/user/light-all`}
                      id={"users"}

                      columns={[
                          {key: 'ID', value: 'id', function: (id) => `#${id}`},
                          {key: 'Name', value: 'name'},
                          {key: 'Surname', value: 'surname'},
                          {key: 'Email', value: 'email'},
                          {
                              key: 'Roles',
                              value: 'roles',
                              function: (roles) => roles.length > 0 ? roles.join(', ') : '/'
                          },
                          {key: 'Cart Items', value: 'cartItems'},
                          {key: 'Wishlist Items', value: 'wishlistItems'},
                          {key: 'Address Count', value: 'addresses'},
                      ]}


                      onRowClick={(user) => navigate(`/admin/user/${user.id}`)}

                      noneFound={<div className="text-center text-gray-500">
                          <p>No users found.</p>
                          <p>There are no users in the system.</p>
                      </div>}

                      foundMessage={<div>
                          <p>These are the users registered in the system.</p>
                          <p>Click on a user to manage their details.</p>
                      </div>}

            />
        </div>
    );
}

export default AdminUserHome;