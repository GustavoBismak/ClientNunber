create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Usuário'), 
    coalesce(new.raw_user_meta_data->>'role', 'receptionist')
  );
  return new;
end;
$$ language plpgsql security definer;
