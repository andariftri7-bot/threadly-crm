import { redirect } from 'next/navigation';

export default function SuperadminRootPage() {
  // Direct to primary admin panel
  redirect('/admin');
}
