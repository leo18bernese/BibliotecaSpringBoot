import React from 'react';
import Pageable from "../../ui/pages/Pageable";
import {usePageTitle} from "../../utils/usePageTitle";

const Security = () => {

    usePageTitle('Security & Access Logs');

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Security & Access Logs</h2>

            <Pageable endpoint={`/api/auth/account-accesses`}
                      id={"accesses"}

                      columns={[
                          {key: 'Ip address', value: 'ipAddress', function: (ipAddress) => ipAddress},
                          {
                              key: 'Login time',
                              value: 'loginTime',
                              function: (loginTime) => new Date(loginTime).toLocaleString()
                          },
                          {
                              key: 'Logout time',
                              value: 'logoutTime',
                              function: (logoutTime) => logoutTime ? new Date(logoutTime).toLocaleString() : 'N/A'
                          },
                      ]}

                      noneFound={<div className="text-center text-gray-500">
                          <p>No access records found.</p>
                      </div>}

                      foundMessage={<div>
                          <p>Below is a list of your recent access logs. If you notice any unfamiliar activity, please
                              contact support immediately.</p>
                          <p>You are able to take action for certain activities, such as logging out from other
                              devices.</p>
                      </div>}
            />
        </div>
    );
};

export default Security;
