import { useEffect } from 'react';

export function useDocumentTitle(title: string, suffix?: string) {
  useEffect(() => {
    const prev = document.title;
    const finalSuffix = suffix !== undefined ? suffix : (title.includes('HinchWall') ? '' : 'HinchWall');
    document.title = finalSuffix ? `${title} | ${finalSuffix}` : title;
    return () => { document.title = prev; };
  }, [title, suffix]);
}
