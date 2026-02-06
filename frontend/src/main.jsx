import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { DocumentsProvider } from './context/DocumentsContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DocumentsProvider>
      <App />
    </DocumentsProvider>
  </StrictMode>
);
