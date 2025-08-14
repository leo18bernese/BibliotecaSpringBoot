import React, {useEffect, useState} from "react";

const ViewableField = ({
                           id, label, icon, value, description
                       }) => {

    const borderColor = 'border-gray-300';

    return (
        <div className={"mt-6 ml-4"}>

            <div className="flex flex-col flex-1">
                <label htmlFor={id} className="flex-1 text-lg select-none text-gray-600">
                    {label}
                </label>

                {description && <span className="text-sm text-gray-500 mb-1">{description}</span>}
            </div>

            <div className={"flex items-center space-x-2 border-b-4 " + borderColor + " transition-all"}>
                <i className={`bx bx-${icon} text-2xl`}></i>

                <input
                    id={id}
                    value={value}
                    disabled={true}

                    className="flex-1 bg-transparent outline-none text-lg"
                />
            </div>
        </div>
    );
}

export default ViewableField;