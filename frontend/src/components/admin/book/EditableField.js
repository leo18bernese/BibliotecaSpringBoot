import React, {useEffect, useState} from "react";

const EditableField = ({id, label, icon, value, placeholder, minChars, maxChars, type, onChange}) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');


    console.log("EditableField rendered with value:", value);

    const handleBlur = () => {
        setEditing(false);

        if (inputValue !== value) {
            onChange(inputValue);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;

        if (newValue.length <= maxChars) {
            setInputValue(newValue);
        }
    };

    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value || '');
        }
    })

    const chars = inputValue.length;
    const borderColor = chars >= maxChars ? 'border-red-300' : editing ? 'border-gray-500' : 'border-gray-300';

    return (
        <div className="mt-4">
            <label htmlFor={id}>{label}:</label>

            <div className={"flex items-center space-x-2 border-b-4 " + borderColor + " transition-all"}>
                <i className={`bx bx-${icon} text-2xl`}></i>

                <input
                    type={type || "text"}
                    min={minChars}
                    max={maxChars}
                    id={id}
                    value={inputValue}

                    onChange={handleInputChange}
                    onFocus={() => setEditing(true)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}

                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-lg"
                />

                {(type !== "number" && !!maxChars) && (
                <span className="text-sm text-gray-500">{maxChars - chars}</span>
                )}
            </div>
        </div>
    );
}

export default EditableField;