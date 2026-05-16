import api from './api';

const LS_SESSION = "medilink_session";

/* =====================
   SESSION
===================== */
export function setSession(session) {
  localStorage.setItem(LS_SESSION, JSON.stringify(session));
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(LS_SESSION));
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(LS_SESSION);
}

/* =====================
   AUTH FUNCTIONS
===================== */
export async function login(email, password) {
  try {
    const response = await api.auth.login({ email, password });
    const session = {
      token: response.token,
      userId: response.userId,
      email: response.email,
      name: response.name,
      role: response.role,
      avatar: response.avatar,
      city: response.city,
    };
    setSession(session);
    return session;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
}

export async function register(userData) {
  try {
    const response = await api.auth.register(userData);
    const session = {
      token: response.token,
      userId: response.userId,
      email: response.email,
      name: response.name,
      role: response.role,
      avatar: response.avatar,
      city: response.city,
    };
    setSession(session);
    return session;
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
}

export function logout() {
  clearSession();
}

/* =====================
   TEMPORARY STUBS (for pages not yet updated to use API)
   TODO: Update admin pages to use backend API
===================== */
export function loadUsers() {
  // Temporary stub - admin pages should use API instead
  console.warn('loadUsers() is deprecated - use backend API instead');
  return [];
}

export function saveUsers(users) {
  // Temporary stub - admin pages should use API instead
  console.warn('saveUsers() is deprecated - use backend API instead');
}

/* =====================
   ADMIN DEMO
===================== */
export const ADMIN_DEMO = {
  email: "admin@medilink.com",
  password: "admin123",
};
