import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './components/theme-provider';
import { devMockService } from './dev/mockService';
import { ServicesProvider } from './shared/context/ServiceContext';

const mockServices =
  import.meta.env.VITE_MOCK === 'true' ? devMockService : undefined;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ServicesProvider services={mockServices}>
        <App />
      </ServicesProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
