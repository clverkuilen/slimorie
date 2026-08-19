-- Nutrient lookup table. Adding a new nutrient never requires a schema change:
-- insert a row here and start writing food_nutrients rows against its key.
create table public.nutrients (
  key text primary key,
  display_name text not null,
  unit text not null,
  category text not null check (category in ('primary', 'secondary', 'micro')),
  sort_order int not null default 0
);

alter table public.nutrients enable row level security;

create policy "nutrients are readable by authenticated users"
  on public.nutrients for select
  to authenticated
  using (true);

insert into public.nutrients (key, display_name, unit, category, sort_order) values
  ('energy_kcal', 'Calories', 'kcal', 'primary', 10),
  ('protein_g', 'Protein', 'g', 'primary', 20),
  ('carbohydrate_g', 'Carbohydrates', 'g', 'primary', 30),
  ('fat_g', 'Fat', 'g', 'primary', 40),
  ('fiber_g', 'Fiber', 'g', 'primary', 50),
  ('sugar_g', 'Sugar', 'g', 'primary', 60),
  ('saturated_fat_g', 'Saturated Fat', 'g', 'secondary', 70),
  ('trans_fat_g', 'Trans Fat', 'g', 'secondary', 80),
  ('sodium_mg', 'Sodium', 'mg', 'secondary', 90),
  ('cholesterol_mg', 'Cholesterol', 'mg', 'secondary', 100),
  ('added_sugar_g', 'Added Sugar', 'g', 'micro', 110),
  ('potassium_mg', 'Potassium', 'mg', 'micro', 120),
  ('calcium_mg', 'Calcium', 'mg', 'micro', 130),
  ('iron_mg', 'Iron', 'mg', 'micro', 140),
  ('vitamin_d_mcg', 'Vitamin D', 'mcg', 'micro', 150);
