import React, { createContext, useContext, useState } from 'react';

interface UserContextType {
  balance: number;
  updateBalance: (newBalance: number) => void;
  triggerRefresh: boolean;
  setTriggerRefresh: (value: boolean) => void;
}

const UserContext = createContext<UserContextType>({
  balance: 0,
  updateBalance: () => {},
  triggerRefresh: false,
  setTriggerRefresh: () => {}
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(parseFloat(localStorage.getItem('balance') || '0'));
  const [triggerRefresh, setTriggerRefresh] = useState(false);

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
    localStorage.setItem('balance', newBalance.toString());
  };

  return (
    <UserContext.Provider value={{ balance, updateBalance, triggerRefresh, setTriggerRefresh }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
