-- Promove o usuário específico para o cargo de Administrador
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'bismakgustavo3@gmail.com'
);
