import React from "react";

// Create a name input
export const NameSelector: React.FC<{
    name: string;
    setName: (name: string) => void;
}> = ({ name, setName }) => {
    return (
        <div
            style={{
                width: '283px',
                height: '1.7em',
                display: 'flex',
                padding: '6px',                 
                fontSize: '1.2em'
            }}
        >
            <label htmlFor="name" style={{
                width: '60px',
                padding: '6px',                 
                flex: '0 0 auto'
            }}>Name:</label>
            <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                    padding: '6px',
                    flex: '1 1 auto'
                }}
            />
        </div>
    );
};