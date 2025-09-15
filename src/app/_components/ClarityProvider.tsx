'use client';

import { useEffect } from 'react';

export default function ClarityProvider() {
  useEffect(() => {
    import('@microsoft/clarity').then((clarity) => {
      if (clarity?.default?.init) {
        clarity.default.init('tawjxgbgdh');
      }
    }).catch((error) => {
      console.warn('Failed to load Microsoft Clarity:', error);
    });
  }, []);

  return null;
}