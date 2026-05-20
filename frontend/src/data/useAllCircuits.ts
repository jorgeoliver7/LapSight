import { useEffect, useState, useCallback } from 'react';
import { CIRCUITS, Circuit } from './circuits';
import { loadCustomCircuits } from './customCircuits';

/**
 * Hook que devuelve [...CIRCUITS, ...customs] de LocalStorage.
 * `refresh()` recarga los customs.
 */
export function useAllCircuits(): { circuits: Circuit[]; refresh: () => void } {
  const [customs, setCustoms] = useState<Circuit[]>(() => loadCustomCircuits());

  const refresh = useCallback(() => {
    setCustoms(loadCustomCircuits());
  }, []);

  // Recargar al recibir storage events de otras pestañas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'rt-custom-circuits-v1') {
        refresh();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  return {
    circuits: [...CIRCUITS, ...customs],
    refresh,
  };
}
