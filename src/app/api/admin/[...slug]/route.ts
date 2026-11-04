import { NextRequest, NextResponse } from 'next/server';

function verifySuperadmin(req: NextRequest) {
  const superadminEmail = (process.env.SUPERADMIN_EMAIL || 'andariftri7@gmail.com').toLowerCase().trim();

  const authCookie = req.cookies.get('threadly_auth')?.value;
  if (!authCookie) {
    return false;
  }

  try {
    const session = JSON.parse(decodeURIComponent(authCookie));
    const sessionEmail = (session.email || '').toLowerCase().trim();
    const isVerified = session.email_verified === true || session.verified === true;
    const isSuper = session.is_superadmin === true;

    if (
      session &&
      sessionEmail === superadminEmail &&
      isVerified &&
      isSuper
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!verifySuperadmin(req)) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json({ status: 'ok', message: 'Superadmin sub-route authorized' });
}

export async function POST(req: NextRequest) {
  if (!verifySuperadmin(req)) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json({ status: 'ok', message: 'Superadmin sub-route processed' });
}
