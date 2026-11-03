import { useCallback, useEffect, useRef } from 'react';

interface SidebarTabFocusOptions {
  activeTab: string;
  availableTabsSignature: string;
  openedTabsSignature: string;
  storedWidth: number;
  tabRequestNonce?: number;
}

export const useSidebarTabFocus = ({
  activeTab,
  availableTabsSignature,
  openedTabsSignature,
  storedWidth,
  tabRequestNonce,
}: SidebarTabFocusOptions) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const pendingTabFocusRef = useRef<string | undefined>(undefined);
  const pendingTabFocusTimeoutRef = useRef<number | undefined>(undefined);

  const scrollActiveTabIntoView = useCallback(() => {
    const tabs = tabsRef.current;
    const activeTabButton = tabs?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    const activeTabItem = activeTabButton?.parentElement;
    if (!tabs || !activeTabItem) return;

    const tabsRect = tabs.getBoundingClientRect();
    const activeTabRect = activeTabItem.getBoundingClientRect();
    if (activeTabRect.left < tabsRect.left) {
      tabs.scrollLeft += activeTabRect.left - tabsRect.left;
    } else if (activeTabRect.right > tabsRect.right) {
      tabs.scrollLeft += activeTabRect.right - tabsRect.right;
    }
  }, []);

  const focusPendingTab = useCallback(() => {
    const pendingTab = pendingTabFocusRef.current;
    if (!pendingTab) return;

    const tabButton = Array.from(
      tabsRef.current?.querySelectorAll<HTMLButtonElement>('button[data-tab-key]') ?? [],
    ).find((button) => button.dataset.tabKey === pendingTab);
    if (!tabButton) return;

    if (pendingTabFocusTimeoutRef.current !== undefined) {
      window.clearTimeout(pendingTabFocusTimeoutRef.current);
      pendingTabFocusTimeoutRef.current = undefined;
    }
    tabButton.focus();
    pendingTabFocusRef.current = undefined;
  }, []);

  const requestTabFocus = useCallback(
    (tab: string) => {
      pendingTabFocusRef.current = tab;
      if (pendingTabFocusTimeoutRef.current !== undefined) {
        window.clearTimeout(pendingTabFocusTimeoutRef.current);
      }
      // Base UI normally resolves this through onOpenChangeComplete. A short
      // fallback also covers background Electron windows where transition
      // completion is frame-throttled indefinitely.
      pendingTabFocusTimeoutRef.current = window.setTimeout(() => {
        if (pendingTabFocusRef.current === tab) focusPendingTab();
      }, 300);
    },
    [focusPendingTab],
  );

  useEffect(() => {
    scrollActiveTabIntoView();
  }, [
    activeTab,
    availableTabsSignature,
    openedTabsSignature,
    scrollActiveTabIntoView,
    storedWidth,
    tabRequestNonce,
  ]);

  useEffect(
    () => () => {
      if (pendingTabFocusTimeoutRef.current !== undefined) {
        window.clearTimeout(pendingTabFocusTimeoutRef.current);
      }
    },
    [],
  );

  return {
    focusPendingTab,
    pendingTabFocusRef,
    requestTabFocus,
    scrollActiveTabIntoView,
    tabsRef,
  };
};
