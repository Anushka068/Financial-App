import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MenuContextType {
  activeMenuItem: string;
  setActiveMenuItem: (item: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

interface MenuProviderProps {
  children: ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <MenuContext.Provider value={{
      activeMenuItem,
      setActiveMenuItem,
      isSidebarOpen,
      setIsSidebarOpen
    }}>
      {children}
    </MenuContext.Provider>
  );
};