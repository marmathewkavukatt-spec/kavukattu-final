'use client';

import { useEffect } from 'react';

export default function Preloader() {
  useEffect(() => {
    function hidePreloader() {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.classList.add('hide');
      }
    }

    if (document.readyState === 'complete') {
      hidePreloader();
    } else {
      window.addEventListener('load', hidePreloader);
      return () => window.removeEventListener('load', hidePreloader);
    }
  }, []);

  return (
    <div id="preloader" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/uploads/mar-mathew-kavukatt-church-logo.jpg" alt="" width={200} height={200} />
    </div>
  );
}