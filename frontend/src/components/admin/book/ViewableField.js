import React, {useEffect, useState} from "react";

const ViewableField = ({
                           id, label, icon, value, description
                       }) => {

    return (
        <div className={"mt-8  ml-4"}>

            <div className="flex flex-col flex-1">
                <label htmlFor={id} className="flex-1 text-lg select-none font-semibold text-gray-600">
                    {label}
                </label>

                {description && <span className="text-sm text-gray-500 mb-1">{description}</span>}
            </div>

            <div className={"flex items-center space-x-2 rounded-xl transition-all"}>
                {icon && (
                    <i className={`bx bx-${icon} text-2xl`}></i>
                )}

                <span className="text-2xl">{value}</span>

            </div>
        </div>
    );
}

export default ViewableField;