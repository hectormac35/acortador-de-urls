# 🔗 Acortador de URLs

Aplicación web para **acortar URLs**, con **autenticación de usuarios**, panel de gestión y **registro de clics**.  
Cada usuario puede crear, activar/desactivar y borrar sus propios enlaces.

Proyecto desarrollado como parte de mi **portfolio personal**.

---

## 🚀 Funcionalidades

- Registro e inicio de sesión de usuarios
- Creación de URLs cortas (slug personalizado u automático)
- Panel de control con:
  - Copiar enlace
  - Editar URL destino
  - Activar / desactivar enlaces
  - Borrar enlaces
- Contador de clics por URL
- Redirección rápida y segura
- Protección por usuario (cada uno solo ve y gestiona sus enlaces)

---

## 🛠️ Tecnologías utilizadas

- Next.js 16 (App Router)
- TypeScript
- NextAuth.js (Credentials Provider)
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Zod
- bcrypt

---

## 📦 Requisitos previos

- Node.js 18 o superior
- PostgreSQL
- npm

---

## ⚙️ Instalación y ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/acortador-de-urls.git
cd acortador-de-urls

## 🐳 Ejecutar con Docker

Requisitos:
- Docker
- Docker Compose

```bash
docker compose up

