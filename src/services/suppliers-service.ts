import { ConflictError } from "../errors/conflict-error"
import { suppliersRepository } from "../repositories/suppliers-repository"

export const suppliersService = {
  listSuppliers: async (filters: { name?: string; porte?: string } = {}) => {
    const portes = filters.porte
      ?.split(",")
      .map((porte) => porte.trim())
      .filter(Boolean)

    return suppliersRepository.findAll({ name: filters.name, portes })
  },

  getSupplierById: async (id: string) => {
    const supplier = await suppliersRepository.findById(id)

    if (!supplier) {
      throw new Error("Fornecedor não encontrado")
    }

    return supplier
  },

  getSupplierWithBiddings: async (id: string, minValue?: number) => {
    const supplier = await suppliersRepository.findByIdWithBiddings(id, minValue)

    if (!supplier) {
      throw new Error("Fornecedor não encontrado")
    }

    return supplier
  },

  countSuppliersByPorte: async () => {
    const groups = await suppliersRepository.countByPorte()

    return groups.map((group) => ({
      porte: group.porte,
      total: group._count._all,
    }))
  },

  createSupplier: async (data: { name: string; cnpj: string; porte: string }) => {
    if (!data.name || !data.cnpj || !data.porte) {
      throw new Error("Nome, CNPJ e porte são obrigatórios")
    }

    try {
      return await suppliersRepository.create(data)
    } catch {
      throw new Error("Não foi possível criar o fornecedor. O CNPJ pode já estar cadastrado")
    }
  },

  updateSupplier: async (
    id: string,
    data: Partial<{ name: string; cnpj: string; porte: string }>,
  ) => {
    try {
      return await suppliersRepository.update(id, data)
    } catch {
      throw new Error("Fornecedor não encontrado")
    }
  },

  deleteSupplier: async (id: string) => {
    const supplier = await suppliersRepository.findById(id)

    if (!supplier) {
      throw new Error("Fornecedor não encontrado")
    }

    const totalBiddings = await suppliersRepository.countBiddings(id)

    if (totalBiddings > 0) {
      throw new ConflictError(
        `Fornecedor possui ${totalBiddings} licitação(ões) vinculada(s) e não pode ser removido`,
      )
    }

    await suppliersRepository.delete(id)
  },
}
