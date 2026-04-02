const PENDING_INVITE_KEY = 'pendingInvite';
const AUTH_FLOW_KEY = 'authFlow';

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function normalizeInviteCode(code = '') {
  return code.trim().toUpperCase();
}

export function getPendingInviteCode() {
  if (!canUseSessionStorage()) return '';
  return normalizeInviteCode(window.sessionStorage.getItem(PENDING_INVITE_KEY) || '');
}

export function setPendingInviteCode(code) {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(PENDING_INVITE_KEY, normalizeInviteCode(code));
}

export function clearPendingInviteCode() {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(PENDING_INVITE_KEY);
}

export function getAuthFlow() {
  if (!canUseSessionStorage()) return '';
  return window.sessionStorage.getItem(AUTH_FLOW_KEY) || '';
}

export function setAuthFlow(flow) {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(AUTH_FLOW_KEY, flow);
}

export function clearAuthFlow() {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(AUTH_FLOW_KEY);
}
