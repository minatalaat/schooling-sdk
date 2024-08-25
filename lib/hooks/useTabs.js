import { useState } from 'react';

export const useTabs = () => {
  const [selectedTab, setSelectedTab] = useState(null);
  const [showTabsContent, setShowTabsContent] = useState(false);

  const goTo = tab => {
    setSelectedTab(tab);
  };

  return { selectedTab, setSelectedTab, showTabsContent, setShowTabsContent, goTo };
};
