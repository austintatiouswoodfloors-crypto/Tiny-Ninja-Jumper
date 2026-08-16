import { useCallback, useEffect, useState } from "react";
import { storage } from "@/src/utils/storage";
import { KEY_HAPTICS } from "./constants";

export interface Settings {
  haptics: boolean;
}

const DEFAULTS: Settings = { haptics: true };

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const haptics = await storage.getItem<boolean>(KEY_HAPTICS, true);
      setSettings({ haptics: haptics ?? true });
      setLoaded(true);
    })();
  }, []);

  const setHaptics = useCallback((v: boolean) => {
    setSettings((s) => ({ ...s, haptics: v }));
    storage.setItem(KEY_HAPTICS, v);
  }, []);

  return { settings, loaded, setHaptics };
}
