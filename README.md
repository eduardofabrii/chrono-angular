# Chrono Angular

Chrono é um sistema de gerenciamento de projetos e controle de horas, projetado para ajudar os usuários a rastrear e gerenciar as horas gastas em várias tarefas e projetos. Esta é a aplicação frontend desenvolvida com Angular.

## Demonstração

Fluxo da aplicação: [video](https://youtu.be/qup17tThqWY) 

Uma versão de deploy está disponível em [https://chrono-steel-six.vercel.app/](https://chrono-steel-six.vercel.app/)

**Nota:** O serviço de demonstração pode estar desabilitado (caso queira testar fique a vontade para entrar em contato comigo via e-mail - eduardohfabri@gmail.com).

## Funcionalidades

- Controle e gerenciamento das horas gastas em projetos e tarefas
- Organização de tarefas, com atribuição para membros da equipe e acompanhamento do progresso
- Visualização de dados sobre o tempo gasto em tarefas e projetos
- Interface de autenticação de usuários
- Dashboard interativo para gerenciamento de múltiplos projetos

## Tecnologias

Este projeto utiliza as seguintes tecnologias:

- **Frontend:** Angular 17
- **UI Framework:** PrimeNG
- **Backend:** Java Spring Boot (API separada)
- **Comunicação:** HttpClient para consumo da REST API

## Instalação

Siga os passos abaixo para rodar o Chrono Angular localmente:

### Pré-requisitos

Certifique-se de que você tem as seguintes ferramentas instaladas:

- Node.js (versão 18 ou superior) - v18.20.5
- npm (geralmente vem com o Node.js) - 10.8.2
- Angular CLI (`npm install -g @angular/cli`) - 17.3.12

### Configuração do Frontend

#### 1. Clonar o Repositório

```bash
git clone https://github.com/eduardofabrii/chrono-app.git
cd chrono-angular
```

#### 2. Instalar as Dependências

```bash
npm install
```

#### 3. Configurar a Conexão com o Backend

Abra o arquivo `src/environments/environment.ts` e verifique se a URL da API está configurada corretamente:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

Para produção, existe um arquivo de ambiente separado que pode ser configurado de acordo.

#### 4. Iniciar o Servidor de Desenvolvimento

```bash
ng serve
```

A aplicação estará disponível para acessar no endereço `http://localhost:4200/`.

**Importante:** Para funcionalidade completa, você precisa ter o backend Chrono API rodando. Veja detalhes de instalação em [https://github.com/eduardofabrii/chrono-api](https://github.com/eduardofabrii/chrono-api).

## Contato

Eduardo Fabri - eduardohfabri@gmail.com

Link do Projeto Frontend: [https://github.com/eduardofabrii/chrono-app](https://github.com/eduardofabrii/chrono-app)  
Link do Projeto Backend: [https://github.com/eduardofabrii/chrono-api](https://github.com/eduardofabrii/chrono-api)
