-- Limpa os testes de clique primeiro
DELETE FROM attendances;

-- Deleta as categorias repetidas
DELETE FROM categories
WHERE id NOT IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER(PARTITION BY name ORDER BY created_at ASC) as rn
        FROM categories
    ) sub
    WHERE sub.rn = 1
);
