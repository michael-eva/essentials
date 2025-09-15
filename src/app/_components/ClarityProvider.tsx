'use client';

import { useEffect } from 'react';

export default function ClarityProvider() {
  useEffect(() => {
    import('@microsoft/clarity').then((clarity) => {
      clarity.default.init('tawjxgbgdh');
    });
  }, []);

  return null;
}