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
        <Editor height='50vh' defaultLanguage='javascript'  onChange={(value: string | undefined) => {
          setCode(value ? value : "");
        }}/>
        <ControlArea code={code} />
      </div>
    </div>
  );
}

export default App;
