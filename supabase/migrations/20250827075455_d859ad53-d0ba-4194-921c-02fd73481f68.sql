-- Tighten RLS: restrict product-related tables to authenticated users only

-- Ensure RLS is enabled
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.units_of_measure enable row level security;
alter table public.product_codes enable row level security;

-- Drop overly permissive public policies if they exist
DROP POLICY IF EXISTS "Allow public access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public access to product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow public access to units_of_measure" ON public.units_of_measure;
DROP POLICY IF EXISTS "Allow public access to product_codes" ON public.product_codes;

-- Products: authenticated-only CRUD
create policy "Authenticated can select products"
  on public.products
  for select
  to authenticated
  using (true);

create policy "Authenticated can insert products"
  on public.products
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update products"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete products"
  on public.products
  for delete
  to authenticated
  using (true);

-- Product categories: authenticated-only CRUD
create policy "Authenticated can select product_categories"
  on public.product_categories
  for select
  to authenticated
  using (true);

create policy "Authenticated can insert product_categories"
  on public.product_categories
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update product_categories"
  on public.product_categories
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete product_categories"
  on public.product_categories
  for delete
  to authenticated
  using (true);

-- Units of measure: authenticated-only CRUD
create policy "Authenticated can select units_of_measure"
  on public.units_of_measure
  for select
  to authenticated
  using (true);

create policy "Authenticated can insert units_of_measure"
  on public.units_of_measure
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update units_of_measure"
  on public.units_of_measure
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete units_of_measure"
  on public.units_of_measure
  for delete
  to authenticated
  using (true);

-- Product codes: authenticated-only CRUD
create policy "Authenticated can select product_codes"
  on public.product_codes
  for select
  to authenticated
  using (true);

create policy "Authenticated can insert product_codes"
  on public.product_codes
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update product_codes"
  on public.product_codes
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete product_codes"
  on public.product_codes
  for delete
  to authenticated
  using (true);
