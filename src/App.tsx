import { Editor } from '@monaco-editor/react';
import { Canvas } from './components/Canvas';
import { ControlArea } from './components/ControlArea';
import React from 'react';

function App() {
  const setInputSize = () => {
    const inputCol = document.getElementById('input-column');
    const canvas = document.getElementById('canvas');

    if (inputCol && canvas) {
      inputCol.style.width = `${window.innerWidth - canvas?.clientWidth}px`
    }
  }
  
  React.useEffect(() => {
    window.onresize = () => {
      setInputSize();
    }

    setInputSize();
  }, [])

  const [code, setCode] = React.useState<string>("");

  return (
    <div className='app-row'>
      <div id='canvas'>
        <Canvas />
      </div>
      <div id='input-column'>
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
