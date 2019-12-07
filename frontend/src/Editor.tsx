import React from "react";

import * as Api from "./api";

export const Editor: React.FC = () => {
  const response = Api.useGenerate();
  return (
    <div>
      <p>Hello</p>
      <p>Response: {response}</p>
    </div>
  );
};
