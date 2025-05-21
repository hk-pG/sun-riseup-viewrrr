import { createContext, useContext } from 'react';
import type { FileSystemService } from '../service/FileSystem.types';
import { tauriFileSystemService } from '../service/tauriAdapters';

const servicesContext = createContext<FileSystemService>(
  tauriFileSystemService,
);

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
