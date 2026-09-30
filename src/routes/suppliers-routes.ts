import type { FastifyInstance } from "fastify"
import { suppliersService } from "../services/suppliers-service"

const supplierProperties = {
  id: { type: "string" },
  name: { type: "string" },
  cnpj: { type: "string" },
  porte: { type: "string" },
  createdAt: { type: "string", format: "date-time" },
}

const supplierSchema = {
  type: "object",
  properties: supplierProperties,
}

const errorSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
}

const idParamsSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
}

export async function suppliersRoutes(app: FastifyInstance) {
  app.get(
    "/suppliers",
    {
      schema: {
        tags: ["suppliers"],
        querystring: {
          type: "object",
          properties: {
            name: { type: "string", description: "Busca parcial pelo nome" },
            porte: {
              type: "string",
              description: "Um ou mais portes separados por vírgula (ex: ME,EPP)",
            },
          },
        },
        response: {
          200: { type: "array", items: supplierSchema },
        },
      },
    },
    async (request, reply) => {
      const { name, porte } = request.query as { name?: string; porte?: string }

      const suppliers = await suppliersService.listSuppliers({ name, porte })
      return reply.send(suppliers)
    },
  )

  app.get(
    "/suppliers/stats",
    {
      schema: {
        tags: ["suppliers"],
        description: "Quantidade de fornecedores agrupada por porte",
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                porte: { type: "string" },
                total: { type: "integer" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const stats = await suppliersService.countSuppliersByPorte()
      return reply.send(stats)
    },
  )

  app.get(
    "/suppliers/:id",
    {
      schema: {
        tags: ["suppliers"],
        params: idParamsSchema,
        response: {
          200: supplierSchema,
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }

      try {
        const supplier = await suppliersService.getSupplierById(id)
        return reply.send(supplier)
      } catch (error) {
        return reply.status(404).send({ message: (error as Error).message })
      }
    },
  )

  app.get(
    "/suppliers/:id/biddings",
    {
      schema: {
        tags: ["suppliers"],
        description: "Fornecedor com suas licitações, opcionalmente filtradas por valor mínimo",
        params: idParamsSchema,
        querystring: {
          type: "object",
          properties: {
            minValue: { type: "number", description: "Valor mínimo da licitação" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              ...supplierProperties,
              biddings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    number: { type: "string" },
                    value: { type: "number" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const { minValue } = request.query as { minValue?: number }

      try {
        const supplier = await suppliersService.getSupplierWithBiddings(id, minValue)
        return reply.send(supplier)
      } catch (error) {
        return reply.status(404).send({ message: (error as Error).message })
      }
    },
  )

  app.post(
    "/suppliers",
    {
      schema: {
        tags: ["suppliers"],
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            cnpj: { type: "string" },
            porte: { type: "string" },
          },
          required: ["name", "cnpj", "porte"],
          additionalProperties: false,
        },
        response: {
          201: supplierSchema,
          400: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const body = request.body as { name: string; cnpj: string; porte: string }

      try {
        const newSupplier = await suppliersService.createSupplier(body)
        return reply.status(201).send(newSupplier)
      } catch (error) {
        return reply.status(400).send({ message: (error as Error).message })
      }
    },
  )

  app.patch(
    "/suppliers/:id",
    {
      schema: {
        tags: ["suppliers"],
        params: idParamsSchema,
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            cnpj: { type: "string" },
            porte: { type: "string" },
          },
          additionalProperties: false,
        },
        response: {
          200: supplierSchema,
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = request.body as Partial<{ name: string; cnpj: string; porte: string }>

      try {
        const updated = await suppliersService.updateSupplier(id, body)
        return reply.send(updated)
      } catch (error) {
        return reply.status(404).send({ message: (error as Error).message })
      }
    },
  )

  app.delete(
    "/suppliers/:id",
    {
      schema: {
        tags: ["suppliers"],
        params: idParamsSchema,
        response: {
          204: { type: "null", description: "Removido com sucesso" },
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }

      try {
        await suppliersService.deleteSupplier(id)
        return reply.status(204).send()
      } catch (error) {
        return reply.status(404).send({ message: (error as Error).message })
      }
    },
  )
}
