import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — TaskFlow`;
    return () => { document.title = 'TaskFlow — Task Management'; };
  }, [title]);
}
