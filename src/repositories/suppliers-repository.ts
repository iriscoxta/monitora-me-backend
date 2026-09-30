import { prisma } from "../lib/prisma"

export const suppliersRepository = {
  findAll: async (filters: { name?: string; portes?: string[] } = {}) => {
    return prisma.supplier.findMany({
      where: {
        name: filters.name ? { contains: filters.name, mode: "insensitive" } : undefined,
        porte: filters.portes?.length ? { in: filters.portes } : undefined,
      },
      orderBy: { createdAt: "desc" },
    })
  },

  findById: async (id: string) => {
    return prisma.supplier.findUnique({ where: { id } })
  },

  findByIdWithBiddings: async (id: string, minValue?: number) => {
    return prisma.supplier.findUnique({
      where: { id },
      include: {
        biddings: {
          where: minValue !== undefined ? { value: { gte: minValue } } : undefined,
          orderBy: { value: "desc" },
        },
      },
    })
  },

  countByPorte: async () => {
    return prisma.supplier.groupBy({
      by: ["porte"],
      _count: { _all: true },
      orderBy: { porte: "asc" },
    })
  },

  create: async (data: { name: string; cnpj: string; porte: string }) => {
    return prisma.supplier.create({ data })
  },

  update: async (
    id: string,
    data: Partial<{ name: string; cnpj: string; porte: string }>,
  ) => {
    return prisma.supplier.update({
      where: { id },
      data,
    })
  },

  delete: async (id: string) => {
    return prisma.supplier.delete({ where: { id } })
  },
}
