import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { LinkRow } from '../lib/models';
import { useActiveLink } from '../features/links/hooks/useActiveLink';

type UploadAction = 'camera-photo' | 'camera-video' | 'gallery' | null;

type ActiveLinkContextValue = {
  activeLink: LinkRow | null;
  loading: boolean;

  createLinkVisible: boolean;
  openCreateLink: () => void;
  closeCreateLink: () => void;

  uploadAction: UploadAction;
  requestUpload: (action: UploadAction) => void;
  clearUploadAction: () => void;
};

const ActiveLinkContext = createContext<ActiveLinkContextValue>({
  activeLink: null,
  loading: true,
  createLinkVisible: false,
  openCreateLink: () => {},
  closeCreateLink: () => {},
  uploadAction: null,
  requestUpload: () => {},
  clearUploadAction: () => {},
});

export function ActiveLinkProvider({ children }: { children: ReactNode }) {
  const { activeLink, loading } = useActiveLink();
  const [createLinkVisible, setCreateLinkVisible] = useState(false);
  const [uploadAction, setUploadAction] = useState<UploadAction>(null);

  const openCreateLink = useCallback(() => setCreateLinkVisible(true), []);
  const closeCreateLink = useCallback(() => setCreateLinkVisible(false), []);
  const requestUpload = useCallback(
    (action: UploadAction) => setUploadAction(action),
    [],
  );
  const clearUploadAction = useCallback(() => setUploadAction(null), []);

  const value = useMemo(
    () => ({
      activeLink,
      loading,
      createLinkVisible,
      openCreateLink,
      closeCreateLink,
      uploadAction,
      requestUpload,
      clearUploadAction,
    }),
    [
      activeLink,
      loading,
      createLinkVisible,
      openCreateLink,
      closeCreateLink,
      uploadAction,
      requestUpload,
      clearUploadAction,
    ],
  );

  return (
    <ActiveLinkContext.Provider value={value}>
      {children}
    </ActiveLinkContext.Provider>
  );
}

export const useActiveLinkContext = () => useContext(ActiveLinkContext);
