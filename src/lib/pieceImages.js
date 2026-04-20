iimport React, { createContext, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const PieceImagesContext = createContext({});

export function PieceImagesProvider({ children }) {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const pieceImages = user?.piece_images || {};

  return (
    <PieceImagesContext.Provider value={pieceImages}>
      {children}
    </PieceImagesContext.Provider>
  );
}

export function usePieceImages() {
  return useContext(PieceImagesContext);
}
