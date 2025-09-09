import React from "react";

const ButtonField = ({
                         id, label, icon, value, actionText, onClick, description
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

            <button
                className={"flex items-center space-x-1.5 border-b-4 transition-all hover:bg-gray-300 p-2 rounded-lg"}
                onClick={() => {
                    if (onClick) {
                        onClick(value);
                    }
                }}>
                <i className={`bx bx-${icon} text-2xl`}></i>

                <span
                    className="text-gray-500 hover:text-gray-700 focus:outline-none">
                    {actionText}
                </span>
            </button>
        </div>
    );
}

export default ButtonField;