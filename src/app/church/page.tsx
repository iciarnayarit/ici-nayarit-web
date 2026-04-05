import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { CHURCH_ADMIN_MEMBERS_PORTAL_URL, emailsIncludeChurchAdmin } from '@/lib/church-admin';

export default async function ChurchPage() {
  const user = await currentUser();
  const adminEmail = process.env.EMAIL_ADMIN ?? '';

  if (!user || !emailsIncludeChurchAdmin(user.emailAddresses, adminEmail)) {
    redirect('/');
  }

  redirect(CHURCH_ADMIN_MEMBERS_PORTAL_URL);
}
