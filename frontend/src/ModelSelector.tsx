import React from "react";

// Create a model input from the options
export const ModelSelector: React.FC<{
    model: string;
    setModel: (model: string) => void;
    options: { [key: string]: { name: string } };
}> = ({ model, setModel, options}) => {
    return (
        <div
        style={{
            maxWidth: '283px',
            height: '1.7em',
            display: 'flex',
            padding: '6px',
            fontSize: '1.2em'                 
        }}
        >
            <label htmlFor="model" style={{
                width: '60px',
                padding: '6px',
                flex: '0 0 auto'
            }}>Model:</label>
            <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                    padding: '6px',
                    flex: '1 1 auto'
                }}
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
