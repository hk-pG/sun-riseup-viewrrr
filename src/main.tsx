import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './providers/ThemeProvider';
import { ServicesProvider } from './shared/context/ServiceContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ServicesProvider>
        <App />
      </ServicesProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
