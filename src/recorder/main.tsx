// Dev-only recorder entry. No StrictMode on purpose: its double-mount in dev
// replays effects, which is awkward for getUserMedia / AudioContext lifecycles.
import ReactDOM from 'react-dom/client';
import { RecorderApp } from './App';
import './recorder.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<RecorderApp />);
