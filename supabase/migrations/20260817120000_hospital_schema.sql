-- ============================================================================
-- AarogyaAI hospital schema
-- Namespaced with hospital_ / hospital-prefixed enums so it never collides
-- with the existing event-platform tables already in this Supabase project.
-- ============================================================================

-- ---------- enums ----------
create type public.hospital_role as enum ('patient', 'doctor', 'admin');
create type public.hospital_appointment_status as enum ('waiting', 'in-consultation', 'completed', 'cancelled');
create type public.hospital_priority as enum ('emergency', 'high', 'normal');
create type public.hospital_triage as enum ('Red', 'Yellow', 'Green');
create type public.hospital_emergency_status as enum ('incoming', 'in-treatment', 'stabilised');

-- ---------- tables ----------

create table public.hospital_departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  icon text default 'Stethoscope',
  open_from text not null default '09:00',
  open_to text not null default '17:00',
  rooms integer not null default 1,
  load integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.hospital_doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department_id uuid references public.hospital_departments(id) on delete set null,
  specialization text default '',
  qualification text default '',
  experience_years integer not null default 0,
  rating numeric(2,1) not null default 4.5,
  fee integer not null default 0,
  room text default '',
  available boolean not null default true,
  days text[] not null default '{}',
  slot_start text not null default '09:00',
  slot_end text not null default '17:00',
  avg_consult_minutes integer not null default 10,
  created_at timestamptz not null default now()
);

create table public.hospital_patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references auth.users(id) on delete set null,
  name text not null,
  age integer,
  gender text,
  phone text,
  blood_group text,
  uhid text not null unique,
  created_at timestamptz not null default now()
);

create table public.hospital_appointments (
  id uuid primary key default gen_random_uuid(),
  token_number integer not null,
  patient_id uuid references public.hospital_patients(id) on delete cascade,
  patient_name text not null,
  doctor_id uuid references public.hospital_doctors(id) on delete cascade,
  department_id uuid references public.hospital_departments(id) on delete set null,
  date date not null,
  slot text not null,
  reason text default '',
  status public.hospital_appointment_status not null default 'waiting',
  priority public.hospital_priority not null default 'normal',
  predicted_wait integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.hospital_emergencies (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  age integer,
  condition text default '',
  triage public.hospital_triage not null default 'Green',
  arrived_at timestamptz not null default now(),
  department_id uuid references public.hospital_departments(id) on delete set null,
  assigned_doctor_id uuid references public.hospital_doctors(id) on delete set null,
  status public.hospital_emergency_status not null default 'incoming'
);

-- Profile row: one per auth user, carries the role + optional doctor/patient link.
create table public.hospital_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role public.hospital_role not null default 'patient',
  doctor_id uuid references public.hospital_doctors(id) on delete set null,
  patient_id uuid references public.hospital_patients(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- helper functions (security definer avoids RLS recursion) ----------

create function public.hospital_current_role()
returns public.hospital_role
language sql stable security definer set search_path = public as
$$ select role from public.hospital_profiles where id = auth.uid() $$;

create function public.hospital_current_doctor_id()
returns uuid
language sql stable security definer set search_path = public as
$$ select doctor_id from public.hospital_profiles where id = auth.uid() $$;

create function public.hospital_current_patient_id()
returns uuid
language sql stable security definer set search_path = public as
$$ select patient_id from public.hospital_profiles where id = auth.uid() $$;

-- Auto-create a profile row whenever someone signs up through the app.
-- Role + name come from the signUp() options.data payload.
create function public.handle_new_hospital_user()
returns trigger
language plpgsql security definer set search_path = public as
$$
begin
  insert into public.hospital_profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.hospital_role, 'patient')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_hospital
  after insert on auth.users
  for each row execute function public.handle_new_hospital_user();

-- ---------- row level security ----------

alter table public.hospital_departments enable row level security;
alter table public.hospital_doctors enable row level security;
alter table public.hospital_patients enable row level security;
alter table public.hospital_appointments enable row level security;
alter table public.hospital_emergencies enable row level security;
alter table public.hospital_profiles enable row level security;

-- profiles: everyone can read their own; admins read all; users can update their own.
create policy "hospital_profiles_select_own_or_admin" on public.hospital_profiles
  for select using (id = auth.uid() or public.hospital_current_role() = 'admin');
create policy "hospital_profiles_update_own" on public.hospital_profiles
  for update using (id = auth.uid());

-- departments & doctors: readable by any signed-in user, writable by admins only.
create policy "hospital_departments_select" on public.hospital_departments
  for select to authenticated using (true);
create policy "hospital_departments_write" on public.hospital_departments
  for all to authenticated using (public.hospital_current_role() = 'admin')
  with check (public.hospital_current_role() = 'admin');

create policy "hospital_doctors_select" on public.hospital_doctors
  for select to authenticated using (true);
create policy "hospital_doctors_write" on public.hospital_doctors
  for all to authenticated using (public.hospital_current_role() = 'admin')
  with check (public.hospital_current_role() = 'admin');

-- patients: own record, or any record if staff.
create policy "hospital_patients_select" on public.hospital_patients
  for select to authenticated using (
    profile_id = auth.uid() or public.hospital_current_role() in ('admin', 'doctor')
  );
create policy "hospital_patients_insert" on public.hospital_patients
  for insert to authenticated with check (
    profile_id = auth.uid() or public.hospital_current_role() = 'admin'
  );
create policy "hospital_patients_update" on public.hospital_patients
  for update to authenticated using (
    profile_id = auth.uid() or public.hospital_current_role() = 'admin'
  );

-- appointments: patient sees their own, doctor sees theirs, admin sees all.
create policy "hospital_appointments_select" on public.hospital_appointments
  for select to authenticated using (
    patient_id = public.hospital_current_patient_id()
    or doctor_id = public.hospital_current_doctor_id()
    or public.hospital_current_role() = 'admin'
  );
create policy "hospital_appointments_insert" on public.hospital_appointments
  for insert to authenticated with check (
    patient_id = public.hospital_current_patient_id()
    or public.hospital_current_role() = 'admin'
  );
create policy "hospital_appointments_update" on public.hospital_appointments
  for update to authenticated using (
    doctor_id = public.hospital_current_doctor_id()
    or public.hospital_current_role() = 'admin'
  );

-- emergencies: staff only.
create policy "hospital_emergencies_select" on public.hospital_emergencies
  for select to authenticated using (public.hospital_current_role() in ('admin', 'doctor'));
create policy "hospital_emergencies_write" on public.hospital_emergencies
  for all to authenticated using (public.hospital_current_role() in ('admin', 'doctor'))
  with check (public.hospital_current_role() in ('admin', 'doctor'));

-- ---------- seed a starter set of departments & doctors (not "demo data" in the ----------
-- ---------- UI sense — this is real catalog data the hospital would configure). ----------
insert into public.hospital_departments (name, description, icon, open_from, open_to, rooms, load) values
  ('General Medicine', 'Fever, infections, chronic care and routine OPD consultations.', 'Stethoscope', '08:00', '20:00', 6, 0),
  ('Cardiology', 'Heart care, ECG, echo and hypertension follow-ups.', 'HeartPulse', '09:00', '17:00', 3, 0),
  ('Orthopaedics', 'Fractures, joint pain, sports injuries and physiotherapy.', 'Bone', '09:00', '18:00', 4, 0),
  ('Paediatrics', 'Child health, immunisation and growth monitoring.', 'Baby', '08:00', '16:00', 4, 0),
  ('Neurology', 'Headache, epilepsy, stroke follow-up and nerve disorders.', 'Brain', '10:00', '16:00', 2, 0),
  ('Dermatology', 'Skin, hair and allergy consultations.', 'Sparkles', '10:00', '15:00', 2, 0),
  ('ENT', 'Ear, nose, throat, audiometry and sinus care.', 'Ear', '09:00', '17:00', 2, 0),
  ('Emergency & Trauma', '24x7 casualty, triage and critical stabilisation.', 'Siren', '00:00', '23:59', 8, 0);
