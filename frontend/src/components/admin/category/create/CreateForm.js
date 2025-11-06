import {useQueryClient} from "@tanstack/react-query";
import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";

/**
 * data structure: [id, displayName, defaultValue, missingErrorMessage, nullable, type, hidden]
 * @constructor
 */
const CreateForm = ({
                        endpoint, data,
                        showAddMessage = "Create New Item",
                        globalSuccessMessage = "Created successfully!",
                        addMessage = "Add New Item",
                        abortMessage = "Cancel",
                        confirmMessage = "Add Item",
                        buttonClassName,
                        children
                    }) => {

    const queryClient = useQueryClient();


    const [showPopup, setShowPopup] = useState(false);

    const [newData, setNewData] = useState({});
    const [errors, setErrors] = useState({});
    const errorRef = useRef(null);

    useEffect(() => {
        setDefaultValues();
    }, [data]);


    const handleChange = (e) => {
        const {name, value} = e.target;

        console.log("Handle Change:", name, value );
        console.log("Before New Data:", newData );

        setNewData(prev => ({...prev, [name]: value}));

        console.log("After New Data:", newData );
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: null}));
        }
    };

    const setDefaultValues = () => {
        const initialData = {};

        data.forEach(([id, , defaultValue]) => {
            initialData[id] = defaultValue || '';
        });

        setNewData(initialData);
    };

    const handlePost = async () => {
        // Basic validation
        const validationErrors = {};

        console.log("Data:", data );
        console.log("New Data:", newData );

        data.forEach(([id, , , missingErrorMessage, nullable]) => {

            console.log("data id:", id, "value:", newData[id]  );

            if (!nullable && (!newData[id] || newData[id].toString().trim() === '')) {

                validationErrors[id] = missingErrorMessage || 'This field is required';
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const finalData = {};

        // Process newData to handle nested properties (e.g., "x.a" -> {x: {a: value}})
        Object.keys(newData).forEach(key => {
            if (key.includes('.')) {
                const parts = key.split('.');
                let current = finalData;

                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) {
                        current[parts[i]] = {};
                    }
                    current = current[parts[i]];
                }

                current[parts[parts.length - 1]] = newData[key];
            } else {
                finalData[key] = newData[key];
            }
        });

        try {
            await axios.post(endpoint, finalData);

            toast.success(globalSuccessMessage);
            setShowPopup(false);

            setDefaultValues();
            setErrors({});

            // Invalidate relevant queries to refresh data
            await queryClient.invalidateQueries();
        } catch (err) {
            toast.error("Error creating item");
            console.error("Error creating item:", err);
        }
    }

    const defaultButtonClassName = "flex items-center border-2 border-green-500 px-4 py-3 rounded-md " +
        "bg-green-100 hover:bg-green-200 w-1/3 transition";

    return <>
        <button
            className={buttonClassName || defaultButtonClassName}
            onClick={() => setShowPopup(true)}
        >
            {children || (
                <>
                    <i className='bx bx-plus-circle text-2xl text-green-600'></i>
                    <span className="ml-2 font-semibold text-green-700">
                        {showAddMessage}
                    </span>
                </>
            )}
        </button>

        {showPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{addMessage}</h3>

                        <button
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                            onClick={() => {
                                setShowPopup(false);

                                setDefaultValues();
                                setErrors({});
                            }}
                        >
                            ×
                        </button>
                    </div>


                    <div className="space-y-4">
                        {data.map(([id, name, , , nullable, type, hidden]) => {
                            return (
                                <div key={id}>
                                    <label className="block text-sm font-medium text-gray-700">{name} {!nullable && <span className="text-red-500">*</span>}</label>
                                    <input
                                        type={type || 'text'}
                                        name={id}
                                        value={newData[id] || ''}
                                        onChange={handleChange}
                                        required={!nullable}
                                        disabled={hidden}
                                        className={`mt-1 block w-full border-2 border-gray-200 rounded-md shadow-sm p-2 ${errors[id] ? 'border-red-500' : ''} ${hidden ? 'bg-gray-100' : ''}`}
                                        ref={node => {
                                            if (errors[id]) errorRef.current = node;
                                        }}
                                    />

                                    {errors[id] && <p className="text-red-500 text-sm">{errors[id]}</p>}
                                </div>
                            );
                        })}

                        <p className="text-sm text-gray-500">* Required fields</p>
                    </div>



                    <div className="flex gap-3 mt-6">
                        <button
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded transition-colors"
                            onClick={() => {
                                setShowPopup(false);

                                setDefaultValues();

                                setErrors({});
                            }}
                        >
                            {abortMessage}
                        </button>
                        <button
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                            onClick={handlePost}
                        >
                            {confirmMessage}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
}

export default CreateForm;