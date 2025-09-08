import React, {useState, useEffect} from "react";

const SelectableRadioField = ({
                                  id,
                                  label,
                                  icon,
                                  options = [], // Array di oggetti {value, label, action}
                                  selectedValue,
                                  onChange,
                                  description,
                                  orientation = 'vertical' // 'vertical' o 'horizontal'
                              }) => {
    const [internalValue, setInternalValue] = useState('');

    useEffect(() => {
        setInternalValue(selectedValue || '');
    }, [selectedValue]);

    const handleOptionChange = (optionValue) => {
        setInternalValue(optionValue);

        // Trova l'opzione selezionata ed esegui la sua azione
        const selectedOption = options.find(option => option.value === optionValue);
        if (selectedOption && selectedOption.action) {
            selectedOption.action(optionValue);
        }

        // Chiama onChange se fornito
        if (onChange) {
            onChange(optionValue);
        }
    };

    const containerClass = orientation === 'horizontal'
        ? 'flex flex-wrap gap-4'
        : 'flex flex-col space-y-2';

    return (
        <div className="mt-6 ml-4">
            <div className="flex flex-col flex-1">
                <label htmlFor={id} className="flex-1 text-lg select-none font-semibold text-gray-600">
                    {label}
                </label>
                {description && (
                    <span className="text-sm text-gray-500 mb-3">{description}</span>
                )}
            </div>

            <div className="flex items-start space-x-2 transition-all">
                {icon && <i className={`bx bx-${icon} text-2xl mt-1`}></i>}

                <div className={`flex-1 ${containerClass}`}>
                    {options.map((option, index) => (
                        <label
                            key={option.value || index}
                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                        >
                            <input
                                type="radio"
                                name={id}
                                value={option.value}
                                checked={internalValue === option.value}
                                onChange={() => handleOptionChange(option.value)}
                                className="mr-3 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 select-none">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SelectableRadioField;