-- 예방접종 기록 + 병원 방문 기록 (건강 관리 대시보드)

create table vaccinations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  vaccine_name text not null,
  administered_date date not null,
  next_due_date date,
  notes text,
  created_at timestamptz not null default now()
);

create index vaccinations_pet_id_idx on vaccinations(pet_id);

create table vet_visits (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  visit_date date not null,
  reason text not null,
  diagnosis text,
  notes text,
  created_at timestamptz not null default now()
);

create index vet_visits_pet_id_idx on vet_visits(pet_id);

alter table vaccinations enable row level security;
alter table vet_visits enable row level security;

create policy "vaccinations_owner_all"
  on vaccinations for all
  using (exists (
    select 1 from pets where pets.id = vaccinations.pet_id and pets.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from pets where pets.id = vaccinations.pet_id and pets.user_id = auth.uid()
  ));

create policy "vet_visits_owner_all"
  on vet_visits for all
  using (exists (
    select 1 from pets where pets.id = vet_visits.pet_id and pets.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from pets where pets.id = vet_visits.pet_id and pets.user_id = auth.uid()
  ));
