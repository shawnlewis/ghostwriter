import React from "react";
import "./App.css";

import { Editor } from "./Editor";
import {ModelSelector} from "./ModelSelector";
import {NameSelector} from "./NameSelector";
import {useServerInterface} from "./ServerInterface";



const App: React.FC = () => {
  const [name, setName] = React.useState("");
  const [model, setModel] = React.useState("");

  const serverInterface = useServerInterface(model, name);

  return (
    <div className="App">
      <header className="App-header">
        <NameSelector name={name} setName={setName} />
        <ModelSelector model={model} setModel={setModel} />
        <Editor serverInterface={serverInterface}/>
      </header>
    </div>
  );
};

export default App;
