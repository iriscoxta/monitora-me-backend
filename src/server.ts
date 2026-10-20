import fastify from "fastify"
import cors from "@fastify/cors"
import jwt from "@fastify/jwt"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import { suppliersRoutes } from "./routes/suppliers-routes"
import { authRoutes } from "./routes/auth-routes"

const app = fastify({ logger: true })

const PORT = Number(process.env.PORT) || 3333
const HOST = process.env.HOST || "0.0.0.0"
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"

app.register(cors, {
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
})

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definida no .env")
}

app.register(jwt, { secret: JWT_SECRET })

app.register(swagger, {
  openapi: {
    info: {
      title: "API CompraAberta",
      description: "API de monitoramento de licitações públicas do Ceará",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
})

app.register(swaggerUi, {
  routePrefix: "/docs",
})
// http://localhost:3333/docs

app.register(authRoutes)
app.register(suppliersRoutes)

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
