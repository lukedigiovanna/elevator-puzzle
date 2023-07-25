import { Editor, Monaco } from '@monaco-editor/react';
import { Canvas } from './components/Canvas';
import { ControlArea } from './components/ControlArea';
import React from 'react';
import { createCompletionFunction } from './utils/codecompletion';

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

  const [code, setCode] = React.useState<string>("// write your code here");

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
            value={code} 
            onChange={(value: string | undefined) => {
              setCode(value ? value : "");
            }}
            options={{
              minimap: {
                enabled: false,
              },
              fontSize: 12,
              wordWrap: "on",
              suggest: {
                showKeywords: false
              }
            }}
            onMount={(editor, monaco: Monaco) => {
              editor.focus();
              monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                noLib: true,
                allowNonTsExtensions: true
              });
              monaco.languages.registerCompletionItemProvider('javascript', {
                provideCompletionItems: createCompletionFunction(monaco)
              });
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
