import React from "react";
import logo from "./logo.svg";
import "./App.css";

import { Editor } from "./Editor";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Editor />
      </header>
    </div>
  );
};

export default App;
