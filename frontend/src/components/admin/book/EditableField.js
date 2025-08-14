import React, {useEffect, useState} from "react";

const EditableField = ({
                           id, label, icon, value, placeholder, minChars, maxChars = 10000,
                           type, onChange, description
                       }) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');

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


        if (type === 'number') {

            if (Number.parseInt(newValue) <= Number.parseInt(maxChars)) {
                setInputValue(newValue);
            }

            return;
        }

        if (newValue.length <= maxChars) {
            setInputValue(newValue);
        }
    };

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    const chars = inputValue.length;
    const borderColor = chars >= maxChars ? 'border-red-300' : editing ? 'border-gray-500' : 'border-gray-300';


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