import { Editor } from '@monaco-editor/react';
import { Canvas } from './components/Canvas';
import { ControlArea } from './components/ControlArea';
import React from 'react';

function App() {
  const [code, setCode] = React.useState<string>("");

  return (
    <div className='app-row'>
      <Canvas />
      <div className='app-col'>
        <div className='editor'>
          <Editor 
            height="100%" 
            defaultLanguage='javascript' 
            value={"// write your code here"} 
            onChange={(value: string | undefined) => {
              setCode(value ? value : "");
            }}
            options={{
              minimap: {
                enabled: false,
              },
              fontSize: 12,
              wordWrap: "on",
            }}
            theme="vs-dark"
          />
        </div>
        <ControlArea code={code} />
      </div>
    </div>
  );
}

export default App;
