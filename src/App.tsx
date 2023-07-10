import { Editor } from '@monaco-editor/react';
import { Canvas } from './components/Canvas';


function App() {
  return (
    <div className='app-row'>
      <Canvas />
      <Editor height='100vh' defaultLanguage='python' />
    </div>
  );
}

export default App;
