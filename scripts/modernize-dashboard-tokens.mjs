import fs from 'fs';
import path from 'path';

const files = [
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/customers/page.tsx',
  'src/app/(dashboard)/customers/[id]/page.tsx',
  'src/app/(dashboard)/orders/page.tsx',
  'src/app/(dashboard)/orders/new/page.tsx',
  'src/app/(dashboard)/orders/[id]/page.tsx',
  'src/app/(dashboard)/products/page.tsx',
  'src/app/(dashboard)/settings/page.tsx',
  'src/app/(dashboard)/followup/page.tsx',
  'src/app/(dashboard)/ai/page.tsx',
  'src/app/[slug]/page.tsx',
];

for (const rel of files) {
  const filePath = path.resolve(rel);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace low contrast slate text
  content = content.replaceAll('text-slate-400 dark:text-slate-500', 'text-muted-foreground');
  content = content.replaceAll('text-slate-500 dark:text-slate-400', 'text-muted-foreground');
  content = content.replaceAll('text-slate-400', 'text-muted-foreground');
  content = content.replaceAll('text-slate-500', 'text-muted-foreground');
  content = content.replaceAll('text-slate-600 dark:text-slate-400', 'text-muted-foreground');
  content = content.replaceAll('text-slate-600 dark:text-slate-300', 'text-muted-foreground');
  content = content.replaceAll('text-slate-700 dark:text-slate-300', 'text-card-foreground');
  content = content.replaceAll('text-navy-900 dark:text-ivory-100', 'text-card-foreground');
  content = content.replaceAll('text-navy-900 dark:text-white', 'text-card-foreground');
  content = content.replaceAll('text-navy-800 dark:text-slate-200', 'text-card-foreground');

  // Replace surfaces and borders
  content = content.replaceAll('bg-white dark:bg-navy-900', 'bg-card');
  content = content.replaceAll('bg-slate-50 dark:bg-navy-800/80', 'bg-muted/60');
  content = content.replaceAll('bg-slate-50 dark:bg-navy-800', 'bg-muted/60');
  content = content.replaceAll('bg-slate-50 dark:bg-navy-900', 'bg-muted/40');
  content = content.replaceAll('bg-slate-50 dark:bg-slate-900', 'bg-muted/40');
  content = content.replaceAll('border-slate-200 dark:border-navy-800', 'border-border');
  content = content.replaceAll('border-slate-200 dark:border-navy-700', 'border-border');
  content = content.replaceAll('border-slate-100 dark:border-navy-800', 'border-border');
  content = content.replaceAll('border-slate-200/80 dark:border-navy-800', 'border-border');
  content = content.replaceAll('border-slate-200', 'border-border');
  content = content.replaceAll('border-slate-100', 'border-border');
  content = content.replaceAll('divide-slate-200 dark:divide-navy-800', 'divide-border');
  content = content.replaceAll('divide-slate-100 dark:divide-navy-800', 'divide-border');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${rel}`);
}
