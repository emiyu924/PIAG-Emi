# Almoxarifado da Clínica Odontológica

Sistema web para consultar e controlar o estoque de materiais da clínica. A interface permite ver a quantidade de cada item, registrar entradas e saídas e acompanhar o histórico.

## Como executar

```bash
cd Almoxarifado
npm install
npm start
```

Abra [http://localhost:3000](http://localhost:3000).

## Base de materiais

O arquivo `data/materiais.json` organiza o almoxarifado: materiais, quantidades, estoque mínimo, fornecedor, localização, movimentações e dados da clínica.

O servidor lê esse arquivo a cada operação e grava nele as alterações feitas na tela. Também é possível editar o JSON diretamente para incluir equipamentos odontológicos e quantidades; a próxima consulta da aplicação usa o conteúdo atualizado.

## O que a aplicação faz

- Painel com totais, categorias e itens que precisam de reposição
- Estoque com busca, categoria, situação e ordenação
- Entrada e saída de quantidade, sem permitir saldo negativo
- Cadastro, edição e remoção de materiais
- Histórico de movimentações com operador, motivo e saldo
- Detalhe de cada item, com localização, fornecedor e reposição até o mínimo
