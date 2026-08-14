/* Central admin authorization boundary. Customer roles never unlock admin content. */
(function () {
  let state = { status: 'guest', user: null, error: null };
  const subscribers = new Set();
  const snapshot = () => ({ ...state, user: state.user ? { ...state.user } : null });
  const notify = () => subscribers.forEach((listener) => listener(snapshot()));
  const setState = (next) => { state = { ...state, ...next }; notify(); };

  const admin = {
    getState: snapshot,
    subscribe(listener) { subscribers.add(listener); listener(snapshot()); return () => subscribers.delete(listener); },
    setGuest() { setState({ status: 'guest', user: null, error: null }); },
    setLoading() { setState({ status: 'loading', error: null }); },
    setUnavailable(message = 'Admin authentication service is not configured.') { setState({ status: 'unavailable', user: null, error: message }); },
    setError(message = 'Unable to verify administrator access.') { setState({ status: 'error', user: null, error: message }); },
    setAuthorized(user) {
      const allowedRoles = new Set(['owner', 'admin', 'manager', 'support', 'editor']);
      if (!user || !allowedRoles.has(user.role) || !user.id) {
        setState({ status: 'error', user: null, error: 'Administrator access is required.' });
        return;
      }
      setState({ status: 'authorized', user: { id: user.id, role: user.role, name: user.name || null, email: user.email || null }, error: null });
    },
  };
  window.NibrexoAdminAuth = Object.freeze(admin);
})();
