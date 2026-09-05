'use client';

import { useEffect, useCallback, useRef } from 'react';

interface ShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  /** If true, shortcut fires even when inside input/textarea elements */
  enableInInputs?: boolean;
}

export function useKeyboardShortcut(
  options: ShortcutOptions,
  callback: (e: KeyboardEvent) => void,
) {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  const { key, ctrlKey, metaKey, shiftKey, altKey, enableInInputs } = options;

  const handler = useCallback(
    (e: KeyboardEvent) => {
      // Don't fire in input fields unless explicitly allowed
      if (!enableInInputs) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      const keyMatch = e.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = ctrlKey ? e.ctrlKey || e.metaKey : true;
      const metaMatch = metaKey ? e.metaKey || e.ctrlKey : true;
      const shiftMatch = shiftKey ? e.shiftKey : !e.shiftKey || !shiftKey;
      const altMatch = altKey ? e.altKey : true;

      // For modifier-only shortcuts, require at least one modifier
      const needsModifier = ctrlKey || metaKey;
      if (needsModifier) {
        if (keyMatch && (e.ctrlKey || e.metaKey) && shiftMatch && altMatch) {
          e.preventDefault();
          callbackRef.current(e);
        }
      } else if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        callbackRef.current(e);
      }
    },
    [key, ctrlKey, metaKey, shiftKey, altKey, enableInInputs],
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
