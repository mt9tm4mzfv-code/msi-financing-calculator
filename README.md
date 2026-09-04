# DRIVELOAN PRO TITANIUM V1 = e8fc0be919e0

Locked logic:
- RB = S*0.8*1.17+OPDP
- TermRateMap 2Y=23%, 3Y=42%, 4Y=49%, 5Y=57%, 6Y=67%, 7Y=78%
- Toggle w-[44px] h-[24px]
- Rounded [16px][20px][22px]
- Lineage SILVER f28ffa508c3d -> TITANIUM e8fc0be919e0

## 1. Deploy to Github
```bash
cd driveloan-pro-titanium-v1-e8fc0be919e0
git init
git add .
git commit -m "TITANIUM V1 e8fc0be919e0 - LOCKED"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/driveloan-pro.git
git push -u origin main
```

Then Vercel / Netlify:
- Import from Github
- Build: npm run build
- Output: dist

## 2. Deploy to Supabase

### Create Project at supabase.com

### SQL - Run in SQL Editor:
```sql
create table calculations (
 id uuid default gen_random_uuid() primary key,
 created_at timestamp default now(),
 user_id uuid references auth.users,
 variant text,
 srp numeric,
 opdp numeric,
 premium_on boolean,
 term_years int,
 bank_rate numeric,
 client_dp_amount numeric,
 monthly numeric,
 detailed_text text
);

-- Enable RLS
alter table calculations enable row level security;
create policy "Users can manage own" on calculations for all using (auth.uid() = user_id);

create table profiles (
 id uuid references auth.users primary key,
 username text,
 role text default 'agent'
);
```

### Add Auth:
- Enable Email auth in Supabase Dashboard
- Add site URL: your vercel URL

### Update App.tsx for Supabase (optional save):
Add at top:
```
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
```

Then save calc:
```
await supabase.from('calculations').insert({ user_id: user.id, variant, srp, ... })
```

## Live Demo
This version is TITANIUM V1 e8fc0be919e0 with 2-7 years termRateMap inside comparison modal.
