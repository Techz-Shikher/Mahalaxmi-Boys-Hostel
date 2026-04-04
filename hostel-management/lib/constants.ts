// lib/constants.ts
export const ROLES = {
  ADMIN: 'Admin',
  STUDENT: 'Student',
};

export const COMPLAINT_STATUS = {
  PENDING: 'Pending',
  RESOLVED: 'Resolved',
};

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  ADMIN_DASHBOARD: '/admin/dashboard',
  STUDENT_DASHBOARD: '/student/dashboard',
  UNAUTHORIZED: '/unauthorized',
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  PASSWORD_MISMATCH: 'Passwords do not match',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  USER_NOT_FOUND: 'User not found',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
};

export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  ROOM_CREATED: 'Room created successfully',
  ROOM_UPDATED: 'Room updated successfully',
  ROOM_DELETED: 'Room deleted successfully',
  COMPLAINT_SUBMITTED: 'Complaint submitted successfully',
  COMPLAINT_UPDATED: 'Complaint status updated',
  ANNOUNCEMENT_POSTED: 'Announcement posted successfully',
};
