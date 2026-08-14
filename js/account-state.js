/*
 * Central customer authentication/session state store.
 * It has no provider connection by itself. A future provider adapter should update this store.
 */
(function () {
  let state = {
    status: 'guest',
    user: null,
    error: null,
    returnTo: null,
  };
  const subscribers = new Set();

  const snapshot = () => ({ ...state, user: state.user ? { ...state.user } : null });
  const notify = () => subscribers.forEach((listener) => listener(snapshot()));

  const setState = (next) => {
    state = { ...state, ...next };
    notify();
  };

  const auth = {
    getState: snapshot,
    subscribe(listener) {
      subscribers.add(listener);
      listener(snapshot());
      return () => subscribers.delete(listener);
    },
    setGuest(returnTo = null) {
      setState({ status: 'guest', user: null, error: null, returnTo });
    },
    setLoading() {
      setState({ status: 'loading', error: null });
    },
    setUnavailable(message = 'Authentication service is not configured.') {
      setState({ status: 'unavailable', user: null, error: message });
    },
    setError(message = 'Unable to verify your account.') {
      setState({ status: 'error', user: null, error: message });
    },
    setExpired(returnTo = null) {
      setState({ status: 'expired', user: null, error: null, returnTo });
    },
    setAuthenticated(user) {
      if (!user || !user.id) return;
      setState({ status: 'authenticated', user: { id: user.id, name: user.name || null, email: user.email || null, role: user.role || null, profileImage: user.profileImage || null, createdAt: user.createdAt || null, accountStatus: user.accountStatus || null }, error: null });
    },
  };

  window.NibrexoAuth = Object.freeze(auth);
})();
