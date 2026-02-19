DROP DATABASE IF EXISTS empresa;
CREATE DATABASE empresa CHARACTER SET utf8 COLLATE utf8_general_ci;
USE empresa;

DROP TABLE IF EXISTS movimentacao;
DROP TABLE IF EXISTS produto;

CREATE TABLE produto (
    id_produto INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    quantidade_estoque INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    data_cadastro DATE NOT NULL DEFAULT (CURRENT_DATE),
    minimo_estoque INT NOT NULL,
    maximo_estoque INT NOT NULL
);

CREATE TABLE movimentacao (
    id_movimentacao INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL,
    quantidade INT NOT NULL,
    id_produto INT NOT NULL,
    datetime_movimentacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tipo CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    CONSTRAINT fk_movimentacao_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

INSERT INTO produto (nome, quantidade_estoque, valor_unitario, minimo_estoque, maximo_estoque) VALUES
('Amaciante de roupas', 100, 0.50, 20, 150),
('Detergente', 25, 18.90, 10, 60),
('Sabao em po', 40, 22.50, 15, 70);

INSERT INTO movimentacao (tipo, quantidade, id_produto) VALUES
('ENTRADA', 50, 1),
('SAIDA', 10, 1),
('SAIDA', 5, 2);
