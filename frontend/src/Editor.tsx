import React from "react";
import { useState } from "react";

import * as Api from "./api";

export const Editor: React.FC = () => {
  const [input, setInput] = useState("");
  const response = Api.useGenerate(input);
  return (
    <div>
      <p>{response}</p>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
      ></textarea>
    </div>
  );
};
