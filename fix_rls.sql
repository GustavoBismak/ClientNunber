-- Remover as políticas antigas que estavam causando o loop infinito
drop policy if exists "Admins can manage profiles" on profiles;
drop policy if exists "Users can view profiles" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Recriar as políticas separando SELECT das outras operações para evitar loop
create policy "Users can view profiles"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Admins can insert profiles"
  on profiles for insert
  to authenticated
  with check ( (select role from profiles where id = auth.uid()) = 'admin' );

create policy "Admins can update other profiles"
  on profiles for update
  to authenticated
  using ( (select role from profiles where id = auth.uid()) = 'admin' );

create policy "Admins can delete profiles"
  on profiles for delete
  to authenticated
  using ( (select role from profiles where id = auth.uid()) = 'admin' );
