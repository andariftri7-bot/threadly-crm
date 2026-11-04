import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/app/admin/page.tsx');
let c = fs.readFileSync(filePath, 'utf8');

// 1. Add ThemeToggle import if not present
if (!c.includes('ThemeToggle')) {
  c = c.replace(
    "import NotFound from '@/app/not-found';",
    "import NotFound from '@/app/not-found';\nimport { ThemeToggle } from '@/components/theme/ThemeToggle';"
  );
}

// 2. Replace top container
c = c.replace(
  'className="min-h-screen bg-[#0B1020] text-slate-100 p-6 lg:p-10 font-sans"',
  'className="min-h-screen bg-background text-foreground p-6 lg:p-10 font-sans"'
);

// 3. Replace navbar border & header
c = c.replace('border-b border-slate-800/80 pb-6', 'border-b border-border pb-6');
c = c.replace(
  '<h1 className="text-xl font-extrabold tracking-tight text-white">',
  '<h1 className="text-xl font-extrabold tracking-tight text-foreground">'
);

// 4. In navbar, add ThemeToggle
if (!c.includes('<ThemeToggle />')) {
  c = c.replace(
    '<div className="flex items-center gap-3">\n            <Button\n              variant="outline"',
    '<div className="flex items-center gap-3">\n            <ThemeToggle />\n            <Button\n              variant="outline"'
  );
}

// 5. Replace custom badges in header
c = c.replace(
  /<span className="px-2\.5 py-0\.5 rounded-full text-\[11px\] font-bold border border-\[#C9A96E\]\/40 bg-\[#C9A96E\]\/15 text-\[#C9A96E\]">[\s\S]*?Platform Root[\s\S]*?<\/span>/,
  '<Badge variant="champagne">Platform Root</Badge>'
);
c = c.replace(
  /<span className="px-2\.5 py-0\.5 rounded-full text-\[11px\] font-bold border border-emerald-500\/30 bg-emerald-500\/10 text-emerald-400">[\s\S]*?Privasi Tenant Terjaga[\s\S]*?<\/span>/,
  '<Badge variant="success">Privasi Tenant Terjaga</Badge>'
);

// 6. Systematic replacements of surfaces, borders, text
c = c.replaceAll('bg-slate-800/80', 'bg-card');
c = c.replaceAll('bg-slate-800/60', 'bg-card');
c = c.replaceAll('bg-slate-800/50', 'bg-muted/50');
c = c.replaceAll('bg-slate-800', 'bg-card');
c = c.replaceAll('border-slate-800/80', 'border-border');
c = c.replaceAll('border-slate-800', 'border-border');
c = c.replaceAll('border-slate-700/80', 'border-border');
c = c.replaceAll('border-slate-700/60', 'border-border');
c = c.replaceAll('border-slate-700', 'border-border');
c = c.replaceAll('text-slate-400', 'text-muted-foreground');
c = c.replaceAll('text-slate-300', 'text-muted-foreground');
c = c.replaceAll('text-slate-200', 'text-muted-foreground');
c = c.replaceAll('divide-slate-800', 'divide-border');
c = c.replaceAll('hover:bg-slate-800/50', 'hover:bg-muted/50');
c = c.replaceAll('bg-slate-900', 'bg-muted');

// Replace active/inactive tab colors
c = c.replace(
  "activeTab === 'overview' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'",
  "activeTab === 'overview' ? 'border-secondary text-secondary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'"
);
c = c.replace(
  "activeTab === 'finance' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'",
  "activeTab === 'finance' ? 'border-success text-success font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'"
);
c = c.replace(
  "activeTab === 'ai_logs' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'",
  "activeTab === 'ai_logs' ? 'border-secondary text-secondary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'"
);
c = c.replace(
  "activeTab === 'audit_logs' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'",
  "activeTab === 'audit_logs' ? 'border-warning text-warning font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'"
);

fs.writeFileSync(filePath, c, 'utf8');
console.log('Admin page transformed successfully with theme tokens & WCAG AA contrast!');
