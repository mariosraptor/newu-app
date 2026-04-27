import { createContext, useContext, useState } from 'react';

interface UpgradeContextType {
  isUpgradeOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
}

const UpgradeContext = createContext<UpgradeContextType>({
  isUpgradeOpen: false,
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
});

export const useUpgrade = () => useContext(UpgradeContext);

export function UpgradeProvider({ children }: { children: React.ReactNode }) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  return (
    <UpgradeContext.Provider value={{
      isUpgradeOpen,
      openUpgradeModal: () => setIsUpgradeOpen(true),
      closeUpgradeModal: () => setIsUpgradeOpen(false),
    }}>
      {children}
    </UpgradeContext.Provider>
  );
}
