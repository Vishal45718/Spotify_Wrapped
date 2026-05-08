import { redirect } from 'next/navigation';

// Root page simply redirects — middleware handles auth check.
// Logged-in users → /dashboard, unauthenticated → /login
export default function RootPage() {
  redirect('/login');
}
