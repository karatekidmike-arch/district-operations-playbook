create table if not exists public.stores (
  id text primary key,
  name text not null,
  concept text not null check (concept in ('Dunkin','Jimmy Johns')),
  sales_goal numeric not null default 0,
  labor_goal numeric not null default 0,
  cogs_goal numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  store_id text not null references public.stores(id) on delete cascade,
  vendor text not null check (vendor in ('Supply It','NDCP','Sysco','Produce','Waste')),
  amount numeric not null check (amount > 0),
  invoice_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.stores enable row level security;
alter table public.invoices enable row level security;

create policy "authenticated users can read stores"
on public.stores for select to authenticated using (true);

create policy "authenticated users can read invoices"
on public.invoices for select to authenticated using (true);

create policy "authenticated users can insert invoices"
on public.invoices for insert to authenticated with check (true);

insert into public.stores (id,name,concept,sales_goal,labor_goal,cogs_goal) values
('354879','National City','Dunkin',250000,24.5,28),
('354966','Miramar','Dunkin',44000,28,28),
('358656','La Jolla','Dunkin',28000,36,28),
('364755','Pacific Beach DD','Dunkin',70000,33,28),
('364559','Montezuma DD','Dunkin',48000,34,28),
('4502','Carlsbad JJ','Jimmy Johns',52000,28,28),
('4501','Escondido JJ','Jimmy Johns',53000,32,28),
('4647','Pacific Beach JJ','Jimmy Johns',56000,30,28),
('4500','Montezuma JJ','Jimmy Johns',26000,27,28)
on conflict (id) do update set
name=excluded.name, concept=excluded.concept, sales_goal=excluded.sales_goal,
labor_goal=excluded.labor_goal, cogs_goal=excluded.cogs_goal;
