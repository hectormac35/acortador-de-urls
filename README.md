🔗 Acortador de URLs

Aplicación web para acortar URLs, con autenticación de usuarios, panel de gestión y registro de clics.
Cada usuario puede crear, activar/desactivar y borrar sus propios enlaces.

Proyecto desarrollado como parte de mi portfolio personal con enfoque en backend moderno y buenas prácticas.

🚀 Funcionalidades

✅ Registro e inicio de sesión de usuarios

🔗 Creación de URLs cortas (slug personalizado u automático)

📊 Contador de clics por enlace

🧑‍💻 Panel de control con:

Copiar enlace

Editar URL destino

Activar / desactivar enlace

Borrar enlace

🔐 Protección por usuario (cada uno solo ve y gestiona sus URLs)

⚡ Redirección rápida y segura

🛠️ Tecnologías utilizadas

Next.js 16 (App Router)

TypeScript

NextAuth.js (Credentials Provider)

Prisma ORM

PostgreSQL

Tailwind CSS

Zod (validaciones)

bcrypt (hash de contraseñas)

📦 Requisitos previos

Node.js 18+

PostgreSQL

npm

⚙️ Instalación y ejecución
1️⃣ Clonar el repositorio
git clone https://github.com/tu-usuario/acortador-de-urls.git
cd acortador-de-urls

2️⃣ Instalar dependencias
npm install

3️⃣ Variables de entorno

Crea un archivo .env en la raíz del proyecto:

DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/acortador?schema=public"
NEXTAUTH_SECRET="una_clave_secreta_larga"
NEXTAUTH_URL="http://localhost:3000"


📌 Importante: no subas nunca este archivo a GitHub.

4️⃣ Prisma (base de datos)
npx prisma generate
npx prisma migrate dev

5️⃣ Arrancar el proyecto
npm run dev


👉 Abre en el navegador:

http://localhost:3000

🧪 Flujo de uso

Registrarse en /register

Iniciar sesión en /login

Crear enlaces desde la página principal

Gestionarlos desde /dashboard

Acceder a un enlace corto:

http://localhost:3000/{slug}

🗂️ Estructura del proyecto (resumen)
app/
 ├─ api/
 │   ├─ auth/            # NextAuth
 │   ├─ register/        # Registro de usuarios
 │   └─ urls/            # CRUD de URLs
 ├─ dashboard/           # Panel del usuario
 └─ page.tsx             # Home (crear enlace)
lib/
 ├─ prisma.ts            # Cliente Prisma
 └─ auth.ts              # Configuración NextAuth
prisma/
 └─ schema.prisma        # Modelos BD

🔐 Seguridad

Contraseñas hasheadas con bcrypt

Rutas protegidas por sesión

Validación de datos con Zod

Control de propiedad (un usuario no puede modificar URLs de otro)
