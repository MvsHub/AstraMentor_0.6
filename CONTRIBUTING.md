# Guia de Contribuição para o AstraMentor

Obrigado pelo interesse em contribuir com o AstraMentor! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuração do Ambiente de Desenvolvimento](#configuração-do-ambiente-de-desenvolvimento)
- [Estilo de Código](#estilo-de-código)
- [Processo de Commit](#processo-de-commit)
- [Pull Requests](#pull-requests)
- [Testes](#testes)
- [Documentação](#documentação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Dependências Principais](#dependências-principais)

## Código de Conduta

Este projeto e todos os participantes estão sujeitos a um Código de Conduta. Ao participar, espera-se que você mantenha este código. Por favor, reporte comportamento inaceitável.

## Como Posso Contribuir?

### Reportando Bugs

- Verifique se o bug já não foi reportado
- Use o template de issue para bugs
- Inclua passos detalhados para reproduzir o problema
- Inclua screenshots se possível

### Sugerindo Melhorias

- Verifique se a melhoria já não foi sugerida
- Use o template de issue para sugestões
- Descreva o comportamento atual e o que você gostaria de ver
- Explique por que esta melhoria seria útil

### Enviando Pull Requests

- Siga as diretrizes de estilo de código
- Escreva testes para suas alterações
- Atualize a documentação conforme necessário
- Siga o processo de commit

## Configuração do Ambiente de Desenvolvimento

Consulte o arquivo [INSTALLATION.md](INSTALLATION.md) para instruções detalhadas sobre como configurar o ambiente de desenvolvimento.

## Estilo de Código

Este projeto usa ESLint e Prettier para manter a consistência do código.

### JavaScript/TypeScript

- Use TypeScript sempre que possível
- Siga as regras do ESLint configuradas no projeto
- Use camelCase para variáveis e funções
- Use PascalCase para componentes React e classes
- Use UPPER_CASE para constantes

### CSS/Tailwind

- Use classes Tailwind para estilização
- Mantenha os estilos globais ao mínimo
- Use variáveis CSS para cores e tamanhos consistentes

### Componentes React

- Um componente por arquivo
- Use componentes funcionais com hooks
- Documente props com TypeScript
- Mantenha os componentes pequenos e focados

## Processo de Commit

- Use mensagens de commit claras e descritivas
- Use o formato: `tipo(escopo): descrição`
- Tipos comuns: feat, fix, docs, style, refactor, test, chore
- Exemplo: `feat(auth): adiciona autenticação com Google`

## Pull Requests

- Crie uma branch a partir da `main`
- Nomeie a branch de forma descritiva (ex: `feature/google-auth`)
- Mantenha os PRs pequenos e focados
- Preencha o template de PR
- Certifique-se de que todos os testes passam
- Solicite revisão após enviar o PR

## Testes

Este projeto usa Jest para testes. Para executar os testes:

