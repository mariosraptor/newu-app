import { createContext, useContext, useState, ReactNode } from 'react';

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

export function useUpgrade() {
  return useContext(UpgradeContext);
}

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  return (
    <UpgradeContext.Provider
      value={{
        isUpgradeOpen,
        openUpgradeModal: () => {
          console.log('[UpgradeContext] openUpgradeModal called → setting isUpgradeOpen=true');
          setIsUpgradeOpen(true);
        },
        closeUpgradeModal: () => setIsUpgradeOpen(false),
      }}
    >
      {children}
    </UpgradeContext.Provider>
  );
}
