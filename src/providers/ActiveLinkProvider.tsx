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

type ActiveLinkContextValue = {
  activeLink: LinkRow | null;
  loading: boolean;

  createLinkVisible: boolean;
  openCreateLink: () => void;
  closeCreateLink: () => void;

  uploadRequested: boolean;
  requestUpload: () => void;
  clearUploadRequest: () => void;
};

const ActiveLinkContext = createContext<ActiveLinkContextValue>({
  activeLink: null,
  loading: true,
  createLinkVisible: false,
  openCreateLink: () => {},
  closeCreateLink: () => {},
  uploadRequested: false,
  requestUpload: () => {},
  clearUploadRequest: () => {},
});

export function ActiveLinkProvider({ children }: { children: ReactNode }) {
  const { activeLink, loading } = useActiveLink();
  const [createLinkVisible, setCreateLinkVisible] = useState(false);
  const [uploadRequested, setUploadRequested] = useState(false);

  const openCreateLink = useCallback(() => setCreateLinkVisible(true), []);
  const closeCreateLink = useCallback(() => setCreateLinkVisible(false), []);
  const requestUpload = useCallback(() => setUploadRequested(true), []);
  const clearUploadRequest = useCallback(() => setUploadRequested(false), []);

  const value = useMemo(
    () => ({
      activeLink,
      loading,
      createLinkVisible,
      openCreateLink,
      closeCreateLink,
      uploadRequested,
      requestUpload,
      clearUploadRequest,
    }),
    [
      activeLink,
      loading,
      createLinkVisible,
      openCreateLink,
      closeCreateLink,
      uploadRequested,
      requestUpload,
      clearUploadRequest,
    ],
  );

  return (
    <ActiveLinkContext.Provider value={value}>
      {children}
    </ActiveLinkContext.Provider>
  );
}

export const useActiveLinkContext = () => useContext(ActiveLinkContext);
