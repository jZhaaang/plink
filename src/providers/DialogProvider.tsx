import {
  useState,
  createContext,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { Dialog, DialogVariant } from '../components';

type DialogProps = {
  title?: string;
  message?: string;
  variant?: DialogVariant;
  okText?: string;
  cancelText?: string;
};

type DialogAPI = {
  alert: (opts: Omit<DialogProps, 'cancelText'>) => Promise<void>;
  confirm: (opts: DialogProps) => Promise<boolean>;
  isOpen: boolean;
  close: () => void;
};

const DialogContext = createContext<DialogAPI | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<DialogProps>({});
  const resolverRef = useRef<
    ((val: 'primary' | 'secondary' | undefined) => void) | null
  >(null);

  const close = useCallback(() => {
    setVisible(false);
    resolverRef.current = null;
  }, []);

  const open = useCallback(
    (next: DialogProps): Promise<'primary' | 'secondary' | undefined> => {
      return new Promise((resolve) => {
        resolverRef.current = resolve;
        setOpts(next);
        setVisible(true);
      });
    },
    [],
  );

  const alert: DialogAPI['alert'] = useCallback(
    async ({ title, message, variant = 'info', okText = 'OK' }) => {
      await open({ title, message, variant, okText });
      return;
    },
    [open],
  );

  const confirm: DialogAPI['confirm'] = useCallback(
    async ({
      title,
      message,
      variant = 'info',
      okText = 'Confirm',
      cancelText = 'Cancel',
    }) => {
      const res = await open({ title, message, variant, okText, cancelText });
      return res === 'primary';
    },
    [open],
  );

  const value = useMemo<DialogAPI>(
    () => ({
      alert,
      confirm,
      isOpen: visible,
      close,
    }),
    [alert, confirm, visible, close],
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      <Dialog
        visible={visible}
        title={opts.title}
        message={opts.message}
        variant={opts.variant ?? 'info'}
        primaryLabel={opts.okText ?? (opts.cancelText ? 'Confirm' : 'OK')}
        onPrimary={() => {
          resolverRef.current?.('primary');
          close();
        }}
        secondaryLabel={opts.cancelText}
        onSecondary={() => {
          resolverRef.current?.('secondary');
          close();
        }}
        onClose={() => {
          resolverRef.current?.(undefined);
          close();
        }}
      />
    </DialogContext.Provider>
  );
}

function alertVariants(alert: DialogAPI['alert']) {
  return {
    info: (title: string, message?: string) =>
      alert({ title, message, variant: 'info' }),
    success: (title: string, message?: string) =>
      alert({ title, message, variant: 'success' }),
    error: (title: string, message?: string) =>
      alert({ title, message, variant: 'error' }),
  };
}

function confirmVariants(confirm: DialogAPI['confirm']) {
  return {
    ask: (title: string, message?: string) =>
      confirm({ title, message, variant: 'info' }),
    danger: (title: string, message?: string) =>
      confirm({ title, message, variant: 'error' }),
  };
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context)
    throw new Error('useDialog must be used within <DialogProvider>');
  const alertV = useMemo(() => alertVariants(context.alert), [context.alert]);
  const confirmV = useMemo(
    () => confirmVariants(context.confirm),
    [context.confirm],
  );

  return {
    ...context,
    ...alertV,
    confirmAsk: confirmV.ask,
    confirmDanger: confirmV.danger,
  };
}
