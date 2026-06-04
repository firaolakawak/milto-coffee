import React, { createContext, useContext, useState, useRef } from 'react';

const TabsContext = createContext();

export const TabsProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('/');
  const scrollPositions = useRef({});
  const navigationStacks = useRef({
    '/': ['/'],
    '/menu': ['/menu'],
    '/orders': ['/orders'],
    '/profile': ['/profile'],
  });

  const saveScrollPosition = (tabPath, position) => {
    scrollPositions.current[tabPath] = position;
  };

  const getScrollPosition = (tabPath) => {
    return scrollPositions.current[tabPath] || 0;
  };

  const resetTabState = (tabPath) => {
    saveScrollPosition(tabPath, 0);
    navigationStacks.current[tabPath] = [tabPath];
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, saveScrollPosition, getScrollPosition, resetTabState }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabsContext = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabsContext must be used within TabsProvider');
  return ctx;
};