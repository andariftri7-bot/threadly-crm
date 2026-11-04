import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const seedPath = path.resolve(process.cwd(), 'seed-data.json');
    if (!fs.existsSync(seedPath)) {
      return NextResponse.json({ error: 'Seed data not found. Please run npm run seed first.' }, { status: 404 });
    }
    const raw = fs.readFileSync(seedPath, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
