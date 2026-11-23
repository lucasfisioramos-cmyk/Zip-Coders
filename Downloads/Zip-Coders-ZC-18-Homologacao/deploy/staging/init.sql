CREATE SCHEMA homologacao_guard;
CREATE TABLE homologacao_guard.identidade (
    ambiente TEXT PRIMARY KEY
);
INSERT INTO homologacao_guard.identidade (ambiente) VALUES ('zip-coders-staging-v1');
