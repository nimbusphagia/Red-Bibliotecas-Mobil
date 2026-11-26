import Storage from "expo-sqlite/kv-store";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { runMigrations } from "@/db/migrate";
import { getSessionAccount, isSetupOpen, login } from "./service";
import type { PublicAccount } from "./types";

const STORAGE_KEY = "session.accountId";

type SessionState =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "setup" }
  | { status: "signed-out" }
  | { status: "signed-in"; account: PublicAccount };

type SessionActions = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  finishSetup: () => void;
  retry: () => void;
};

type Session = SessionState & SessionActions;

const SessionContext = createContext<Session | null>(null);

async function restoreAccount(): Promise<PublicAccount | null> {
  const stored = await Storage.getItem(STORAGE_KEY);
  if (!stored) return null;

  const id = Number(stored);
  const account = Number.isInteger(id) ? await getSessionAccount(id) : null;
  if (!account) await Storage.removeItem(STORAGE_KEY);
  return account;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const set = (next: SessionState) => {
      if (!cancelled) setState(next);
    };

    void (async () => {
      try {
        await runMigrations();

        if (await isSetupOpen()) {
          await Storage.removeItem(STORAGE_KEY);
          return set({ status: "setup" });
        }

        const account = await restoreAccount();
        set(
          account ? { status: "signed-in", account } : { status: "signed-out" },
        );
      } catch (error) {
        set({ status: "error", error });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const actions: SessionActions = {
    async signIn(email, password) {
      const account = await login({ email, password });
      await Storage.setItem(STORAGE_KEY, String(account.id));
      setState({ status: "signed-in", account });
    },
    async signOut() {
      await Storage.removeItem(STORAGE_KEY);
      setState({ status: "signed-out" });
    },
    finishSetup() {
      setState({ status: "signed-out" });
    },
    retry() {
      setState({ status: "loading" });
      setAttempt((n) => n + 1);
    },
  };

  return (
    <SessionContext.Provider value={{ ...state, ...actions }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
