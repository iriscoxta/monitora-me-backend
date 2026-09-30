import fastify from "fastify";
import cors from "@fastify/cors"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import { suppliersRoutes } from "./routes/suppliers-routes";

const app = fastify( {logger: true})

const PORT = Number(process.env.PORT) || 3333
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"

app.register(cors, {
  origin: FRONTEND_URL 
})

app.register(swagger, {
  openapi: {
    info: {
      title: "API CompraAberta",
      description: "API de monitoramento de licitações públicas do Ceará",
      version: "1.0.0"
    }
  }
})

app.register(swaggerUi, {
  routePrefix: "/docs"
}) 
//  http://localhost:3333/docs


app.register(suppliersRoutes)



app.listen( {port: PORT}, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(`Servidor rodando em ${address}`)
})

