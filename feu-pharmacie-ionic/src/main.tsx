import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import PharmacySignEditor from './PharmacySignEditor/PharmacySignEditor';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);