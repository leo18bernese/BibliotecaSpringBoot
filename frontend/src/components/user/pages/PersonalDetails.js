import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {UserContext} from "../UserContext";
import {useNavigate} from "react-router-dom"; // Recommended for prop type validation

const PersonalDetails = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                <p>Loading account details...</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Account Information</h2>

            <div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-500 text-sm">Username</p>
                    <p className="text-lg font-medium">{user.username}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Email Address</p>
                    <p className="text-lg font-medium">{user.email}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Full Name</p>
                    <p className="text-lg font-medium">{user.nome} {user.cognome}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Phone Number</p>
                    <p className="text-lg font-medium">{user.telefono || 'Not provided'}</p>
                </div>
                {/* Add more fields as needed */}


            </div>

                <div className="text-right">
                    <button
                        onClick={() => {
                            navigate('/account/personal-details/edit');
                        }}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2
                        focus:ring-blue-500 focus:ring-opacity-50 "
                    >
                        Edit Details
                    </button>
                </div>

            </div>

            <div className="mt-6 border-t pt-4">
                <h3 className="text-xl font-semibold mb-3">Security</h3>
                <p className="text-gray-700">
                    Your password was last updated on: <span
                    className="font-medium">{user.lastPasswordUpdate || 'N/A'}</span>
                </p>

                <button
                    onClick={() => alert('Navigate to change password page')}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2
                    focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Change Password
                </button>
            </div>
        </div>
    );
};

// Define prop types for better code quality and debugging
PersonalDetails.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        fullName: PropTypes.string,
        phoneNumber: PropTypes.string,
        address: PropTypes.string,
        lastPasswordUpdate: PropTypes.string, // Assuming a string date
    }),
};

// Default props for cases where user might be null initially or properties are missing
PersonalDetails.defaultProps = {
    user: null, // Or an empty object {} if you handle checks internally
};

export default PersonalDetails;