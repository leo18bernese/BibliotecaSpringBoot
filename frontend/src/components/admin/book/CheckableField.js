import React, {useEffect, useState} from "react";

const CheckableField = ({id, label, description, icon, value, onChange, confirm, confirmText}) => {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        setChecked(!!value);
    }, [value]);

    const handleCheckboxChange = (e) => {
        const newCheckedState = e.target.checked;

        const text = confirmText || 'Sei sicuro?';

        if (!confirm || window.confirm(text)) {
            setChecked(newCheckedState);
            if (onChange) {
                onChange(newCheckedState);
            }
        }
    };

    return (
        <div className="mt-4 ml-4">
            <div className="flex items-center space-x-2 border-b-4 border-gray-300 transition-all py-2">
                <i className={`bx bx-${icon} text-2xl`}></i>

                <div className="flex flex-col flex-1">
                    <label htmlFor={id} className="flex-1 text-lg cursor-pointer select-none">
                        {label}
                    </label>

                    {description && <span className="text-sm text-gray-500">{description}</span>}
                </div>

                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 cursor-pointer"
                />
            </div>
        </div>
    );
}

export default CheckableField;