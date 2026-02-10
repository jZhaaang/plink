import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { LinkRow } from '../lib/models';
import { useActiveLink } from '../features/links/hooks/useActiveLink';

type ActiveLinkContextValue = {
  activeLink: LinkRow | null;
  loading: boolean;
  refetch: () => Promise<void>;

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
  refetch: async () => {},
  createLinkVisible: false,
  openCreateLink: () => {},
  closeCreateLink: () => {},
  uploadRequested: false,
  requestUpload: () => {},
  clearUploadRequest: () => {},
});

export function ActiveLinkProvider({ children }: { children: ReactNode }) {
  const { activeLink, loading, refetch } = useActiveLink();
  const [createLinkVisible, setCreateLinkVisible] = useState(false);
  const [uploadRequested, setUploadRequested] = useState(false);

  const openCreateLink = useCallback(() => setCreateLinkVisible(true), []);
  const closeCreateLink = useCallback(() => setCreateLinkVisible(false), []);
  const requestUpload = () => setUploadRequested(true);
  const clearUploadRequest = () => setUploadRequested(false);

  return (
    <ActiveLinkContext.Provider
      value={{
        activeLink,
        loading,
        refetch,
        createLinkVisible,
        openCreateLink,
        closeCreateLink,
        uploadRequested,
        requestUpload,
        clearUploadRequest,
      }}
    >
      {children}
    </ActiveLinkContext.Provider>
  );
}

export const useActiveLinkContext = () => useContext(ActiveLinkContext);
