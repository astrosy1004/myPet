-- 행복한 집사생활 - 초기 스키마
-- auth.users는 Supabase Auth가 관리하므로 별도 users 테이블 없이 참조한다.

create extension if not exists "pgcrypto";

create type species_type as enum ('cat', 'dog');
create type gender_type as enum ('male', 'female', 'unknown');
create type activity_level_type as enum ('low', 'moderate', 'active');

-- 반려동물 기본 정보
create table pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species species_type not null,
  breed text,
  gender gender_type not null default 'unknown',
  birth_date date,
  is_neutered boolean not null default false,
  activity_level activity_level_type not null default 'moderate',
  profile_image_url text,
  created_at timestamptz not null default now()
);

create index pets_user_id_idx on pets(user_id);

-- 체중 기록 이력
create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  recorded_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index weight_logs_pet_id_idx on weight_logs(pet_id);

-- 울음소리 분석 요청/결과
create table sound_analyses (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  audio_url text not null,
  predicted_category text,
  confidence numeric(5,2),
  created_at timestamptz not null default now()
);

create index sound_analyses_pet_id_idx on sound_analyses(pet_id);

-- 행동 영상 분석 요청/결과
create table behavior_analyses (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  video_url text not null,
  description text,
  is_anomaly boolean,
  created_at timestamptz not null default now()
);

create index behavior_analyses_pet_id_idx on behavior_analyses(pet_id);

-- 품종 정적 정보 (시딩 데이터)
create table breeds (
  id uuid primary key default gen_random_uuid(),
  species species_type not null,
  name text not null,
  avg_lifespan text,
  size text,
  temperament_tags text[],
  care_notes text
);

create index breeds_species_idx on breeds(species);

-- Row Level Security: 각 사용자는 자신의 반려동물 데이터만 접근 가능
alter table pets enable row level security;
alter table weight_logs enable row level security;
alter table sound_analyses enable row level security;
alter table behavior_analyses enable row level security;
alter table breeds enable row level security;

create policy "pets_owner_all"
  on pets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weight_logs_owner_all"
  on weight_logs for all
  using (exists (
    select 1 from pets where pets.id = weight_logs.pet_id and pets.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from pets where pets.id = weight_logs.pet_id and pets.user_id = auth.uid()
  ));

create policy "sound_analyses_owner_all"
  on sound_analyses for all
  using (exists (
    select 1 from pets where pets.id = sound_analyses.pet_id and pets.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from pets where pets.id = sound_analyses.pet_id and pets.user_id = auth.uid()
  ));

create policy "behavior_analyses_owner_all"
  on behavior_analyses for all
  using (exists (
    select 1 from pets where pets.id = behavior_analyses.pet_id and pets.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from pets where pets.id = behavior_analyses.pet_id and pets.user_id = auth.uid()
  ));

-- 품종 정보는 로그인한 모든 사용자가 조회 가능
create policy "breeds_read_all"
  on breeds for select
  to authenticated
  using (true);

-- Storage 버킷: 프로필 사진(공개), 음성/영상(비공개, 서버를 통해서만 접근)
insert into storage.buckets (id, name, public)
values
  ('pet-photos', 'pet-photos', true),
  ('pet-sounds', 'pet-sounds', false),
  ('pet-videos', 'pet-videos', false)
on conflict (id) do nothing;

create policy "pet_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'pet-photos');

create policy "pet_photos_owner_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pet-photos' and owner = auth.uid());

create policy "pet_photos_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'pet-photos' and owner = auth.uid());

create policy "pet_sounds_owner_all"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'pet-sounds' and owner = auth.uid())
  with check (bucket_id = 'pet-sounds' and owner = auth.uid());

create policy "pet_videos_owner_all"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'pet-videos' and owner = auth.uid())
  with check (bucket_id = 'pet-videos' and owner = auth.uid());
