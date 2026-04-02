export function getPreferredUserName(user, fallback = 'Amor') {
  return user?.displayName || user?.email?.split('@')[0] || fallback;
}
