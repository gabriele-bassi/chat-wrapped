
import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  adSlot, 
  adFormat = 'auto',
  className = '' 
}) => {
  // Fix: Change the ref type to Element instead of HTMLDivElement
  const adRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Solo se Google AdSense è caricato e siamo in produzione
    if (window.adsbygoogle && process.env.NODE_ENV === 'production') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('Errore nel caricamento dell\'annuncio:', error);
      }
    }
  }, []);

  return (
    <div className={`ad-container my-4 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Sostituire con il tuo ID AdSense
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      <div className="text-xs text-center text-muted-foreground mt-1">Pubblicità</div>
    </div>
  );
};

export default AdBanner;
