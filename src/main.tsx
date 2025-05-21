import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ServicesProvider } from './context/ServiceContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ServicesProvider>
      <App />
    </ServicesProvider>
  </React.StrictMode>,
);
