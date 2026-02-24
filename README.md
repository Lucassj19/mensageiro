#  Mensageiro

Plataforma interna de comunicação por e-mail com templates dinâmicos.

---

##  Como Executar

### Pré-requisitos
- [Docker](https://www.docker.com/) e Docker Compose instalados

### Subindo o projeto
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mensageiro.git
cd mensageiro

# Suba todos os serviços
docker compose up --build
```

Aguarde todos os serviços iniciarem (cerca de 2-3 minutos no primeiro build).

### Serviços disponíveis

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Swagger UI** | http://localhost:8080/swagger-ui.html |

---

##  Arquitetura
```
mensageiro/
├── mensageiro/                  # API Spring Boot (Java 17)
│   ├── src/
│   │   └── main/java/com/zedia/mensageiro/
│   │       ├── config/          # Segurança, CORS, OpenAPI
│   │       ├── controller/      # Endpoints REST
│   │       ├── dto/             # Objetos de transferência
│   │       ├── entity/          # Entidades JPA
│   │       ├── repository/      # Repositórios Spring Data
│   │       ├── security/        # JWT Filter e Util
│   │       └── service/         # Lógica de negócio
│   └── Dockerfile
├── mensageiro-frontend/         # SPA React 18
│   ├── src/
│   │   ├── components/          # Layout, PrivateRoute
│   │   ├── contexts/            # AuthContext
│   │   ├── pages/               # Login, Register, Dashboard, etc.
│   │   └── services/            # Axios API client
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## ⚙️ Stack Tecnológica

**Backend**
- Java 17 + Spring Boot 3.2
- Spring Security + JWT (jjwt 0.12)
- Spring Data JPA + Hibernate
- MySQL 8.0
- SpringDoc OpenAPI 2 (Swagger)
- Lombok

**Frontend**
- React 18 + React Router v6
- Axios para HTTP
- react-hot-toast para notificações
- CSS custom properties (sem UI lib)
- Fontes: Syne + DM Sans

**Infraestrutura**
- Docker + Docker Compose
- Nginx (servir SPA + proxy reverso)

---

## 🔐 Autenticação

A API usa **JWT Bearer Token**. Rotas públicas:
- `POST /api/auth/register` — Cadastro
- `POST /api/auth/login` — Login

Todas as demais rotas exigem header:
```
Authorization: Bearer <token>
```

---

## 📚 Endpoints da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Autenticar |

### Users
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/users/me` | Perfil do usuário logado |
| GET | `/api/users` | Listar usuários |

### Templates
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/templates` | Criar template |
| GET | `/api/templates` | Listar todos |
| GET | `/api/templates/mine` | Listar meus templates |
| GET | `/api/templates/{id}` | Buscar por ID |
| PUT | `/api/templates/{id}` | Atualizar (somente dono) |
| DELETE | `/api/templates/{id}` | Deletar (somente dono) |

### Emails
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/emails/send` | Enviar e-mail com template |
| GET | `/api/emails/history` | Histórico de envios |

---

##  Variáveis nos Templates

Use `{{nome_da_variavel}}` no assunto e corpo:
```
Olá {{nome}},

Informamos que o sistema {{sistema}} estará em manutenção 
no dia {{data}} entre {{inicio}} e {{fim}}.

Atenciosamente,
{{remetente}}
```

---

##  Categorias de Template

| Valor | Label |
|-------|-------|
| `AVISO_INCIDENTE` | Aviso de Incidente |
| `CONFIRMACAO_EQUIPAMENTO` | Confirmação de Equipamento |
| `AVISO_MANUTENCAO` | Aviso de Manutenção |
| `COMUNICADO_EVENTO` | Comunicado de Evento |
| `CONVITE_REUNIAO` | Convite para Reunião |
| `OUTROS` | Outros |

---

##  Testes

O projeto conta com testes unitários cobrindo as principais regras de negócio.

### Executar os testes
```bash
cd mensageiro
mvn test
```

### Cobertura

| Classe | Testes | Cenários cobertos |
|--------|--------|-------------------|
| `AuthService` | 3 | Registro, login, e-mail duplicado |
| `TemplateService` | 7 | CRUD completo, controle de permissão |
| `EmailService` | 6 | Envio, falha SMTP, destinatário inválido, variáveis |

**Total: 16 testes unitários**

### Tecnologias utilizadas nos testes
- JUnit 5
- Mockito
- Spring Boot Test

##  Parar os serviços
```bash
docker compose down

# Remover também os volumes (banco de dados):
docker compose down -v
```
