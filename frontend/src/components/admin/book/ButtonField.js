import React, {useEffect, useState} from "react";

const ButtonField = ({
                         id, label, icon, value, actionText, onChange, description
                     }) => {

    return (
        <div className={"mt-2 ml-4"}>

            {label && (
                <div className="flex flex-col flex-1">

                    <label htmlFor={id} className="flex-1 text-lg select-none font-semibold text-gray-600">
                        {label}
                    </label>

                    {description && <span className="text-sm text-gray-500 mb-1">{description}</span>}
                </div>
            )}

            <div className={"flex items-center space-x-2 border-b-4 transition-all"}>
                <i className={`bx bx-${icon} text-2xl`}></i>

                <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => {
                        if (onChange) {
                            onChange(value);
                        }
                    }}
                >
                    {actionText}
                </button>
            </div>
        </div>
    );
}

export default ButtonField;