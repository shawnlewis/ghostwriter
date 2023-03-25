import React from "react";

// Create a model input from the options
export const ModelSelector: React.FC<{
    model: string;
    setModel: (model: string) => void;
    options: { [key: string]: { name: string } };
}> = ({ model, setModel, options}) => {
    return (
        <div>
            <label htmlFor="model">Model:</label>
            <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
            >
                {Object.keys(options).map((model) => (
                    <option key={model} value={model}>
                        {options[model].name}
                    </option>
                ))}
            </select>
        </div>
    );
};
