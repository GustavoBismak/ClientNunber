-- Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon text,
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create attendances table
create table attendances (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id) not null,
  user_id uuid references auth.users(id) not null,
  observation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users(id) primary key,
  name text not null,
  role text default 'receptionist' check (role in ('admin', 'receptionist')),
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'role', 'receptionist'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security (RLS) setup
alter table categories enable row level security;
alter table attendances enable row level security;
alter table profiles enable row level security;

-- RLS Policies

-- Categories: Everyone authenticated can read. Only admins can insert/update/delete.
create policy "Authenticated users can view active categories"
  on categories for select
  to authenticated
  using (true);

create policy "Admins can manage categories"
  on categories for all
  to authenticated
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Attendances: Receptionists can insert. Authenticated can read.
create policy "Users can insert attendances"
  on attendances for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view attendances"
  on attendances for select
  to authenticated
  using (true);

-- Profiles: Users can read all profiles. Admins can manage.
create policy "Users can view profiles"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Admins can manage profiles"
  on profiles for all
  to authenticated
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Insert initial categories
insert into categories (name, icon, display_order) values 
('Emissão de boleto', 'FileText', 1),
('Suporte', 'Wrench', 2),
('Feedback', 'MessageSquare', 3),
('Cancelamento', 'XCircle', 4),
('Novo cadastro', 'UserPlus', 5),
('Mudança de endereço', 'Home', 6),
('Reativação', 'RefreshCw', 7),
('Troca de titularidade', 'Users', 8),
('Negociação', 'CreditCard', 9),
('Upgrade de plano', 'TrendingUp', 10),
('Downgrade de plano', 'TrendingDown', 11),
('Problema de conexão', 'WifiOff', 12),
('Informações', 'Info', 13),
('Contrato', 'FileSignature', 14),
('Segunda via de contrato', 'Files', 15),
('Outros', 'HelpCircle', 16);
