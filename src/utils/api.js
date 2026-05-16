export const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth token
const getAuthToken = () => {
  const session = JSON.parse(localStorage.getItem('medilink_session') || 'null');
  return session?.token;
};

// Helper function to create headers
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const { includeAuth = true, ...fetchOptions } = options;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: createHeaders(includeAuth),
  });
  
  if (!response.ok) {
    const text = await response.text();
    let errorMessage = text || 'API request failed';
    
    try {
      if (text) {
        const json = JSON.parse(text);
        errorMessage = json.message || json.error || errorMessage;
      }
    } catch (e) {
      // If parsing fails, use the text content or default message
      console.warn("Server returned non-JSON error:", text);
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// ==================== AUTH APIs ====================
export const authAPI = {
  register: (data) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    includeAuth: false,
  }),
  
  login: (data) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    includeAuth: false,
  }),
  
  getCurrentUser: () => apiCall('/auth/me'),
  
  changePassword: (data) => apiCall('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ==================== PATIENT APIs ====================
export const patientAPI = {
  getProfile: (id) => apiCall(`/patient/${id}`),
  
  updateProfile: (id, data) => apiCall(`/patient/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updateProfileFormData: (id, formData) => {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(`http://localhost:8080/api/patient/${id}/profile/update`, {
      method: 'POST',
      headers,
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error('Profile update failed');
      return res.json();
    });
  },
  
  updateVitals: (id, vitals) => apiCall(`/patient/${id}/vitals`, {
    method: 'PUT',
    body: JSON.stringify(vitals),
  }),
};

// ==================== DOCTOR APIs ====================
export const doctorAPI = {
  getAllApproved: () => apiCall('/doctor/all'),
  
  getById: (id) => apiCall(`/doctor/${id}`),
  
  updateProfile: (id, data) => apiCall(`/doctor/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updateProfileFormData: (id, formData) => {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(`http://localhost:8080/api/doctor/${id}/profile/update`, {
      method: 'POST',
      headers,
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error('Profile update failed');
      return res.json();
    });
  },
};

// ==================== ADMIN APIs ====================
export const adminAPI = {
  getPendingDoctors: () => apiCall('/admin/doctors/pending'),
  
  approveDoctor: (id) => apiCall(`/admin/doctors/${id}/approve`, {
    method: 'PUT',
  }),
  
  rejectDoctor: (id) => apiCall(`/admin/doctors/${id}/reject`, {
    method: 'PUT',
  }),
  
  getPendingPosts: () => apiCall('/posts/pending'),
  
  approvePost: (id) => apiCall(`/posts/${id}/approve`, {
    method: 'PUT',
  }),
  
  rejectPost: (id) => apiCall(`/posts/${id}/reject`, {
    method: 'PUT',
  }),
  
  getStats: () => apiCall('/admin/stats'),
};

// ==================== APPOINTMENT APIs ====================
export const appointmentAPI = {
  create: (data) => apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getByPatient: (patientId) => apiCall(`/appointments/patient/${patientId}`),
  
  getByDoctor: (doctorId) => apiCall(`/appointments/doctor/${doctorId}`),
  
  getById: (id) => apiCall(`/appointments/${id}`),
  
  update: (id, data) => apiCall(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiCall(`/appointments/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== REPORT APIs ====================
export const reportAPI = {
  create: (data) => apiCall('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getByPatient: (patientId) => apiCall(`/reports/patient/${patientId}`),
  
  getByDoctor: (doctorId) => apiCall(`/reports/doctor/${doctorId}`),
  
  getById: (id) => apiCall(`/reports/${id}`),
  
  upload: (formData) => {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // We don't set Content-Type here because the browser needs to set 
    // it automatically with the boundary for FormData.
    return fetch('http://localhost:8080/api/reports/upload', {
      method: 'POST',
      headers,
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    });
  },

  delete: (id) => apiCall(`/reports/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== POST APIs ====================
export const postAPI = {
  create: (data) => apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getApproved: () => apiCall('/posts'),
  
  getByDoctor: (doctorId) => apiCall(`/posts/doctor/${doctorId}`),
  
  getById: (id) => apiCall(`/posts/${id}`),
  
  delete: (id) => apiCall(`/posts/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== CHAT APIs ====================
export const chatAPI = {
  sendMessage: (data) => apiCall('/chat/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getConversation: (userId1, userId2) => 
    apiCall(`/chat/messages/${userId1}/${userId2}`),
  
  getConversationPartners: (userId) => apiCall(`/chat/conversations/${userId}`),
  
  markAsRead: (messageId) => apiCall(`/chat/messages/${messageId}/read`, {
    method: 'PUT',
  }),
};

export default {
  auth: authAPI,
  patient: patientAPI,
  doctor: doctorAPI,
  admin: adminAPI,
  appointment: appointmentAPI,
  report: reportAPI,
  post: postAPI,
  chat: chatAPI,
  review: {
    create: (data) => apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getByDoctor: (doctorId) => apiCall(`/reviews/doctor/${doctorId}`),
  },
};
