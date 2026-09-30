import { prisma } from "../lib/prisma"

// type Supplier = {
//     id: string;
//     name: string;
//     porte: string;
// }

export const suppliersRepository = {
    findAll: async () => {
      return prisma.supplier.findMany()
    },

    findById: async (id: string) => {
      return prisma.supplier.findUnique( { where: {id}})
    },

    create: async (data: { name: string; cnpj: string; porte: string}) => {
      return prisma.supplier.create({ data })
    },

    // Partial<Tipo>

    update: async (id: string, data: Partial<{ name: string; cnpj: string; porte: string}> ) => {
      return prisma.supplier.update({
        where: {id},
        data,
      })
    },

    delete: async (id: string) => {
      return prisma.supplier.delete({ where: {id}})
    }

   
}


// PUT vs PATCH 




