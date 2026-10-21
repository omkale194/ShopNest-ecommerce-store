import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthApi } from "../api";
import { session, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (session.token() ? session.user() : null));
  // `ready` becomes true once a stored token has been checked with the server.
  const [ready, setReady] = useState(() => !session.token());

  const endSession = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(endSession);
  }, [endSession]);

  useEffect(() => {
    if (!session.token()) return;
    AuthApi.me()
      .then((fresh) => {
        session.saveUser(fresh);
        setUser(fresh);
      })
      .catch(() => {
        /* a 401 already ended the session; on a network error keep the saved user */
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await AuthApi.login({ email, password });
    session.save(result.token, result.user);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const result = await AuthApi.register({ name, email, password });
    session.save(result.token, result.user);
    setUser(result.user);
    return result.user;
  }, []);

  const value = useMemo(
    () => ({ user, ready, isAdmin: user?.role === "ADMIN", login, register, logout: endSession }),
    [user, ready, login, register, endSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
