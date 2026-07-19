import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './components/theme-provider';
// WARN: devMockService は静的 import のため本番バンドルにも含まれる（tests/fixtures のデータを含む）。
// WARN: VITE_MOCK=true は開発時のみ使用するため実害はないが、厳密に除外したい場合は
// WARN: 動的 import（await import('./dev/mockService')）に変更すること。
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
