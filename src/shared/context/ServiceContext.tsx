import { createContext, useContext } from 'react';
import { tauriFileSystemService } from '../adapters/tauriAdapters';
import type { FileSystemService } from '../../service/FileSystemService';

const servicesContext = createContext<FileSystemService>(
  tauriFileSystemService,
);

/**
 * ファイル取得に関する実装を提供するコンテキストを取得するフック
 * @returns ファイルシステムサービスの実装
 */
export const useServices = (): FileSystemService => useContext(servicesContext);

interface ServicesProviderProps {
  children: React.ReactNode;
  services?: Partial<FileSystemService>;
}

export const ServicesProvider = ({
  children,
  services,
}: ServicesProviderProps) => {
  const providedServices = { ...tauriFileSystemService, ...services };

  return (
    <servicesContext.Provider value={providedServices}>
      {children}
    </servicesContext.Provider>
  );
};
