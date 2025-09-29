import React, {useEffect, useState} from 'react';

const MaskedSuggestionInput = ({
                                   id,
                                   label,
                                   icon,
                                   value,
                                   placeholder,
                                   type = 'text',
                                   maskOptions,
                                   fetchSuggestions,
                                   description,
                                   onChange,
                                   minChars = 0,
                                   maxChars = 10000
                               }) => {

    const [editing, setEditing] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        // Nascondi i suggerimenti se il campo non è in focus
        if (!editing) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            if (fetchSuggestions && value && value.length >= minChars) {
                const data = await fetchSuggestions(value);
                setSuggestions(data);
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(handler);

    }, [value, fetchSuggestions, minChars, editing]); // Aggiungi 'editing' alle dipendenze

    const handleValueChange = (e) => {
        const newValue = e.target.value;
        if (type === 'number') {
            if (+newValue <= maxChars) {
                onChange(newValue);
            }
        } else if (newValue.length <= maxChars) {
            onChange(newValue);
        }
    };

    const handleSuggestionClick = (item) => {
        const val = typeof item === 'string' ? item : item.value;
        onChange(val);
        setSuggestions([]);
    };

    const borderColor = (value?.length || 0) >= maxChars
        ? 'border-red-300'
        : editing ? 'border-gray-500' : 'border-gray-300';

    return (
        <div className="mt-6 ml-4 relative">

            <div className="flex flex-col flex-1">
                <label htmlFor={id} className="flex-1 text-lg select-none font-semibold text-gray-600">
                    {label}
                </label>

                {description && <span className="text-sm text-gray-500 mb-1">{description}</span>}
            </div>

            <div className={"flex items-center space-x-2 border-b-2 rounded-xl " + borderColor + " transition-all"}>
                {icon && <i className={`bx bx-${icon} text-2xl`}></i>}

                <input
                    id={id}
                    name={id}
                    type={type}
                    placeholder={placeholder}
                    value={value || ''}

                    onFocus={() => setEditing(true)}
                    onBlur={() => {
                        // Ritarda la perdita del focus per permettere il click sul suggerimento
                        setTimeout(() => setEditing(false), 150);
                    }}

                    onChange={handleValueChange}
                    className="flex-1 bg-transparent outline-none text-lg"
                />
            </div>

            {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-gray-300 border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg transition-all">
                    {suggestions.map((item, idx) => (
                        <li
                            key={idx}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                            onMouseDown={() => handleSuggestionClick(item)}
                        >
                            {item.label || item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MaskedSuggestionInput;