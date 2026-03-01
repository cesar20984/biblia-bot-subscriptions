# Sistema de Suscripciones Biblia Bendita

Este sistema gestiona las suscripciones de WhatsApp vinculando pagos de Stripe con números de teléfono.

## 🚀 Cómo ponerlo en marcha

### 1. Requisitos Previos
- Una cuenta de **Stripe**.
- Una base de datos **PostgreSQL** (te recomiendo usar **Vercel Postgres** o **Supabase**).
- GitHub para desplegar en Vercel.

### 2. Configuración de Stripe
1. Crea un **Producto** recurrente de $2 USD en Stripe.
2. Genera un **Payment Link**.
3. **Importante**: En la configuración del link, activa "Recopilar número de teléfono". Esto es lo que usaremos para activar el bot.
4. Ve a *Developers > Webhooks* y añade un endpoint: `https://tu-app.vercel.app/api/webhook/stripe`.
5. Selecciona los eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

### 3. Despliegue en Vercel
1. Sube este código a un repositorio de GitHub.
2. Conecta el repositorio a Vercel.
3. Configura las variables de entorno en Vercel:
   - `DATABASE_URL`: La URL de tu base de datos.
   - `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe.
   - `STRIPE_WEBHOOK_SECRET`: El secreto del webhook que te da Stripe al crear el endpoint.

### 4. Estructura del Proyecto
- `src/app/dashboard`: Interfaz premium para ver tus suscriptores.
- `src/app/api/webhook/stripe`: El "cerebro" que recibe los pagos y actualiza la base de datos.
- `prisma/schema.prisma`: Definición de los datos (Suscriptor, teléfono, estado).

## 🛠 Comandos útiles
- `npm install`: Instalar dependencias.
- `npx prisma db push`: Sincronizar la base de datos con el esquema.
- `npm run dev`: Ejecutar en local.
