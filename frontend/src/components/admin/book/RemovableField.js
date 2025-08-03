import React, {useState} from "react";

const EditableField = ({
                           id, label, value, placeholder, minChars, maxChars, type, onChange, onRemove,
                           removable = true
                       }) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');

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

    const chars = inputValue.length;
    const borderColor = chars >= maxChars ? 'border-red-300' : editing ? 'border-gray-500' : 'border-gray-300';

    return (
        <div className="mt-1">

            <div className={"flex items-center transition-all"}>
                <label className="w-1/6" htmlFor={id}>{label}:</label>

                <span className={"border-b-4 " + borderColor}>

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

                {removable && (
                    <button className="text-sm text-gray-500"
                            onClick={() => {
                                setInputValue('');
                                onRemove();
                            }}
                    >
                        <i className={`bxr bx-trash text-xl text-red-500`}></i>
                    </button>
                )}

                </span>

            </div>
        </div>
    );
}

export default EditableField;