-- Remover a restrição antiga que aponta para a tabela interna de autenticação
ALTER TABLE attendances DROP CONSTRAINT IF EXISTS attendances_user_id_fkey;

-- Adicionar a nova restrição apontando diretamente para a tabela pública de perfis (profiles)
ALTER TABLE attendances 
ADD CONSTRAINT attendances_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id);
