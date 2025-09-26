import React, {useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {UserContext} from "../../UserContext";
import EditableField from "../../../fields/EditableField";
import axios from "axios";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";

const updateUser = async ({id, userData}) => {
    const {data} = await axios.patch(`/api/utenti/update`, userData);
    return data;
}

const PersonalDetailsEdit = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        if (user) {
            setFirstName(user.nome || '');
            setLastName(user.cognome || '');
            setPhoneNumber(user.telefono || '');
        }
    }, [user]);

    const mutation = useMutation({
        mutationFn: updateUser,
        onSuccess: (data) => {
            console.log("User updated successfully:", data);

            navigate('/account/personal-details');
        },
        onError: (error) => {
            console.error("Error updating user:", error);
        }
    })

    const handleSave = () => {
        const userData = {
            nome: firstName,
            cognome: lastName,
            telefono: phoneNumber
        };

        mutation.mutate({id: user.id, userData});
    }


    if (!user) {
        return (
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                <p>Loading account details...</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Editing Account Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField key={"firstName-" + user.nome}
                               id="firstName"
                               label="First Name" icon="id-card"
                               value={firstName}
                               placeholder="Enter your first name"
                               minChars={1} maxChars={32}
                               onChange={(newFirstName) => {
                                   setFirstName(newFirstName);
                               }}
                />

                <EditableField key={"lastName-" + user.cognome}
                               id="lastName"
                               label="Last Name" icon="id-card"
                               value={lastName}
                               placeholder="Enter your last name"
                               minChars={1} maxChars={32}
                               onChange={(newLastName) => {
                                   setLastName(newLastName);
                               }}
                />

                <EditableField
                    key={"phoneNumber-" + user.telefono}
                    id="phoneNumber"
                    label="Phone Number" icon="phone"
                    value={phoneNumber}
                    placeholder="Enter your phone number"
                    onChange={setPhoneNumber}
                    mask="000 000 0000"
                />
            </div>

            <div className="mt-8 pt-5 flex justify-end">

                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to discard changes?")) {
                            navigate("/account/personal-details");
                        }
                    }}
                    className="bg-red-300 hover:bg-red-400 text-red-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                >
                    Discard Changes
                </button>

                <button
                    onClick={() => {

                        if (!firstName || !lastName || !phoneNumber) {
                            toast.error('Please fill in all required fields. ');
                            return;
                        }

                        if (window.confirm("Are you sure you want to save changes?")) {
                            handleSave();
                        }
                    }}
                    disabled={mutation.isPending}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                >
                    {mutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

// Define prop types for better code quality and debugging
PersonalDetailsEdit.propTypes = {
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
PersonalDetailsEdit.defaultProps = {
    user: null, // Or an empty object {} if you handle checks internally
};

export default PersonalDetailsEdit;