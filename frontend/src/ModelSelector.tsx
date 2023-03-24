import React from "react";

const modelOptions: { [key: string]: { name: string } } = {
    "gpt-vanilla": {
        name: "GPT-2",
    },
    "gpt-shakespeare": {
        name: "Shakespeare",
    }
}

// Create a model input from the options
export const ModelSelector: React.FC<{
    model: string;
    setModel: (model: string) => void;
}> = ({ model, setModel }) => {
    return (
        <div>
            <label htmlFor="model">Model:</label>
            <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
            >
                {Object.keys(modelOptions).map((model) => (
                    <option key={model} value={model}>
                        {modelOptions[model].name}
                    </option>
                ))}
            </select>
        </div>
    );
};
