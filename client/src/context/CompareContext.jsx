import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_compare_vehicles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('aura_compare_vehicles', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (vehicle) => {
    if (!vehicle) return;
    setCompareList(prev => {
      if (prev.some(v => v._id === vehicle._id || v.slug === vehicle.slug)) {
        return prev;
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 vehicles simultaneously.');
        return prev;
      }
      return [...prev, vehicle];
    });
  };

  const removeFromCompare = (idOrSlug) => {
    setCompareList(prev => prev.filter(v => v._id !== idOrSlug && v.slug !== idOrSlug));
  };

  const isInCompare = (idOrSlug) => {
    return compareList.some(v => v._id === idOrSlug || v.slug === idOrSlug);
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
