import { useCallback, useState } from "react";

export interface UseDisclosureOptions {
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Open/close boolean state with stable `open`/`close`/`toggle` callbacks and
 * the matching `onOpen`/`onClose` side-effect hooks — the state machine
 * behind a Dialog/Popover/Drawer trigger, decoupled from any particular
 * overlay primitive. Callbacks are referentially stable across renders
 * (via `useCallback`) so passing them straight into a `useEffect`
 * dependency array or a memoized child doesn't cause needless re-runs.
 */
export function useDisclosure(options: UseDisclosureOptions = {}): UseDisclosureReturn {
  const { defaultOpen = false, onOpen, onClose } = options;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) onOpen?.();
      else onClose?.();
      return next;
    });
  }, [onOpen, onClose]);

  return { isOpen, open, close, toggle };
}
