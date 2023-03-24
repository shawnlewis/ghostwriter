import React from "react";

// Create a name input
export const NameSelector: React.FC<{
    name: string;
    setName: (name: string) => void;
}> = ({ name, setName }) => {
    return (
        <div>
            <label htmlFor="name">Name:</label>
            <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
        </div>
    );
};