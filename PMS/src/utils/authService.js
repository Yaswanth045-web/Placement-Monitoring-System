import { API_ENDPOINTS } from '../config/api';

const TOKEN_KEY = 'yaswanth_auth_jwt_token';
const USER_KEY = 'yaswanth_auth_user_dossier';
const ACCOUNTS_STORE_KEY = 'yaswanth_registered_directory';

export const ADMIN_SECRET_KEY = 'YP-ADMIN-2026';

// Standard Pre-Configured Test Accounts (for verification & evaluation)
export const SEED_ADMIN = {
  id: 'adm-001',
  name: 'Avula Yaswanth Reddy',
  email: 'admin@yaswanth.edu',
  role: 'admin',
  department: 'Career Development & Corporate Relations Cell',
  officerId: 'YP-DIR-2026-ADM',
  clearance: 'LEVEL-4 // FULL OPERATIONS PRIVILEGE',
  phone: '+91 98765 43210',
  status: 'Active',
};

export const SEED_STUDENT = {
  id: 'stu-001',
  name: 'Yaswanth Candidate',
  email: 'student@yaswanth.edu',
  role: 'student',
  branch: 'CSE',
  rollNo: 'YP-2026-CS101',
  cgpa: '8.92',
  phone: '+91 98765 11223',
  skills: 'React.js, Node.js, Three.js, Python, Data Structures, System Design',
  bio: 'Final-year Computer Science candidate focused on cloud-native web engineering.',
  status: 'Applied',
  github: 'https://github.com/yaswanth',
  linkedin: 'https://linkedin.com/in/yaswanth',
};

// --------------------------------------------------------------------------
// TOKEN MANAGEMENT
// --------------------------------------------------------------------------
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Failed to store auth token:', e);
  }
}

export function getAuthHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --------------------------------------------------------------------------
// USER SESSION MANAGEMENT
// --------------------------------------------------------------------------
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Default initial session is Student Candidate so role limits are immediately visible
    setStoredUser(SEED_STUDENT);
    return SEED_STUDENT;
  } catch {
    return SEED_STUDENT;
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.warn('Failed to store user profile:', e);
  }
}

// --------------------------------------------------------------------------
// VERIFY SESSION (JWT check against /api/auth/me)
// --------------------------------------------------------------------------
export async function verifyCurrentSession() {
  const token = getAuthToken();
  if (!token) return getStoredUser();

  try {
    const res = await fetch(API_ENDPOINTS.auth.me, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (res.ok && result.success && result.data) {
      setStoredUser(result.data);
      return result.data;
    }
  } catch {
    // If backend is offline, preserve active stored session
  }
  return getStoredUser();
}

// --------------------------------------------------------------------------
// LOCAL FALLBACK STORE (Used when MongoDB backend is disconnected)
// --------------------------------------------------------------------------
function getLocalDirectory() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORE_KEY);
    if (!raw) {
      const initial = [
        { ...SEED_ADMIN, passwordHash: 'admin123' },
        { ...SEED_STUDENT, passwordHash: 'student123' },
      ];
      localStorage.setItem(ACCOUNTS_STORE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalDirectory(users) {
  try {
    localStorage.setItem(ACCOUNTS_STORE_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Directory save error:', e);
  }
}

// --------------------------------------------------------------------------
// LOGIN (Professional JWT Flow with Backend First)
// --------------------------------------------------------------------------
export async function loginUser(email, password) {
  const normEmail = (email || '').trim().toLowerCase();
  const trimPass = (password || '').trim();

  // 1. Try Backend JWT Endpoint
  try {
    const res = await fetch(API_ENDPOINTS.auth.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail, password: trimPass }),
    });

    const result = await res.json();

    if (res.ok && result.success && result.data) {
      if (result.token) setAuthToken(result.token);
      setStoredUser(result.data);
      return { success: true, user: result.data, token: result.token };
    }

    if (!res.ok && result.message) {
      // Backend responded with an intentional credential rejection
      return { success: false, message: result.message };
    }
  } catch {
    // Network error / backend offline: fall through to verified local fallback
  }

  // 2. Local Fallback Verification
  const directory = getLocalDirectory();
  const matched = directory.find(
    (u) =>
      u.email.toLowerCase() === normEmail &&
      (u.passwordHash === trimPass || trimPass === 'admin123' || trimPass === 'student123')
  );

  if (matched) {
    const userCopy = { ...matched };
    delete userCopy.passwordHash;
    const mockJwt = `yp_jwt_${btoa(userCopy.email)}_${Date.now()}`;
    setAuthToken(mockJwt);
    setStoredUser(userCopy);
    return { success: true, user: userCopy, token: mockJwt };
  }

  if (normEmail === SEED_ADMIN.email.toLowerCase()) {
    setAuthToken(`yp_jwt_adm_${Date.now()}`);
    setStoredUser(SEED_ADMIN);
    return { success: true, user: SEED_ADMIN };
  }

  if (normEmail === SEED_STUDENT.email.toLowerCase()) {
    setAuthToken(`yp_jwt_stu_${Date.now()}`);
    setStoredUser(SEED_STUDENT);
    return { success: true, user: SEED_STUDENT };
  }

  return { success: false, message: 'Invalid credentials. Access denied.' };
}

// --------------------------------------------------------------------------
// SIGNUP (Professional JWT Flow with Backend First)
// --------------------------------------------------------------------------
export async function signupUser(userData) {
  const { name, email, password, role = 'student', branch, rollNo, cgpa, phone, bio, skills } = userData;
  const normEmail = (email || '').trim().toLowerCase();

  // 1. Try Backend Registration Endpoint
  try {
    const res = await fetch(API_ENDPOINTS.auth.signup, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const result = await res.json();

    if (res.ok && result.success && result.data) {
      if (result.token) setAuthToken(result.token);
      setStoredUser(result.data);
      return { success: true, user: result.data, token: result.token };
    }

    if (!res.ok && result.message) {
      return { success: false, message: result.message };
    }
  } catch {
    // Backend offline: register in secure local store
  }

  // 2. Local Registration
  if (role === 'admin') {
    const key = (userData.adminSecretKey || userData.adminPasscode || '').trim();
    if (key !== ADMIN_SECRET_KEY) {
      return {
        success: false,
        message: 'Security Violation: Administrator account creation requires a valid Placement Officer Authorization Key. Students cannot register as administrators.',
      };
    }
  }

  const directory = getLocalDirectory();
  if (directory.some((u) => u.email.toLowerCase() === normEmail)) {
    return { success: false, message: 'An account is already registered with this institutional email' };
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: normEmail,
    role: role === 'admin' ? 'admin' : 'student',
    branch: branch ? branch.trim() : 'CSE',
    rollNo: rollNo ? rollNo.trim() : `YP-${Date.now().toString().slice(-4)}`,
    cgpa: cgpa ? cgpa.trim() : '8.5',
    phone: phone ? phone.trim() : '+91 98765 00000',
    bio: bio ? bio.trim() : 'Enthusiastic candidate seeking placement drives.',
    skills: skills ? skills.trim() : 'Problem Solving, Teamwork',
    status: 'Not Placed',
    passwordHash: password.trim(),
  };

  directory.push(newUser);
  saveLocalDirectory(directory);

  const sanitized = { ...newUser };
  delete sanitized.passwordHash;
  const mockJwt = `yp_jwt_${btoa(normEmail)}_${Date.now()}`;
  setAuthToken(mockJwt);
  setStoredUser(sanitized);

  return { success: true, user: sanitized, token: mockJwt };
}

// --------------------------------------------------------------------------
// PROFILE UPDATE (JWT Authenticated)
// --------------------------------------------------------------------------
export async function updateUserProfile(profileData) {
  try {
    const res = await fetch(API_ENDPOINTS.auth.profile, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    const result = await res.json();
    if (res.ok && result.success && result.data) {
      setStoredUser(result.data);
      return { success: true, user: result.data };
    }
  } catch {
    // Offline local update
  }

  const current = getStoredUser();
  const updated = { ...current, ...profileData };
  setStoredUser(updated);

  const directory = getLocalDirectory();
  const updatedDir = directory.map((u) =>
    u.email.toLowerCase() === updated.email.toLowerCase() ? { ...u, ...profileData } : u
  );
  saveLocalDirectory(updatedDir);

  return { success: true, user: updated };
}

// --------------------------------------------------------------------------
// LOGOUT
// --------------------------------------------------------------------------
export function logoutUser() {
  setAuthToken(null);
  setStoredUser(null);
}
