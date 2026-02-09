import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { LinkRow } from "../lib/models"
import { useActiveLink } from "../features/links/hooks/useActiveLink";

type ActiveLinkContextValue = {
  activeLink: LinkRow | null;
  loading: boolean,
  refetch: () => Promise<void>;

  createLinkVisible: boolean;
  openCreateLink: () => void;
  closeCreateLink: () => void;

  uploadTrigger: number;
  triggerUpload: () => void;
}

const ActiveLinkContext = createContext<ActiveLinkContextValue>({
  activeLink: null,
  loading: true,
  refetch: async () => {},
  createLinkVisible: false,
  openCreateLink: () => {},
  closeCreateLink: () => {},
  uploadTrigger: 0,
  triggerUpload: () => {},
});

export function ActiveLinkProvider({ children }: { children: ReactNode }) {
  const { activeLink, loading, refetch } = useActiveLink();
  const [createLinkVisible, setCreateLinkVisible] = useState(false);
  const [uploadTrigger, setUploadTrigger] = useState(0);

  const openCreateLink = useCallback(() => setCreateLinkVisible(true), []);
  const closeCreateLink = useCallback(() => setCreateLinkVisible(false), []);
  const triggerUpload = useCallback(() => setUploadTrigger((prev) => prev + 1), []);

  return (
    <ActiveLinkContext.Provider value={{
      activeLink,
      loading,
      refetch,
      createLinkVisible,
      openCreateLink,
      closeCreateLink,
      uploadTrigger,
      triggerUpload
    }}>
      {children}
    </ActiveLinkContext.Provider>
  )
}

export const useActiveLinkContext = () => useContext(ActiveLinkContext);