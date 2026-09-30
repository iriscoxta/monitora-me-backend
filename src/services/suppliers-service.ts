import { suppliersRepository } from "../repositories/suppliers-repository"; 

export const suppliersService = {
    listSuppliers: async () => {
        return suppliersRepository.findAll()
    },

    getSupplierById: async (id: string) => {
    const supplier = await suppliersRepository.findById(id)

    if(!supplier){
        throw new Error("Fornecedor não encontrado")
    }

    return supplier
    },

    createSupplier: async (data: {name: string; porte: string; cnpj: string}) => {
        if (!data.name || !data.porte){
            throw new Error("Nome e porte são obrigatórios")
        }

        return suppliersRepository.create(data)
    },

    updateSupplier: async (id: string, data: Partial<{name:string; cnpj: string; porte: string}>) => {
        try{
            return await suppliersRepository.update(id, data);
        }catch{
            throw new Error("Fornecedor não encontrado")
        }
    },

    deleteSupplier: async (id: string) => {
        try{
            await suppliersRepository.delete(id)
        }catch{
            throw new Error("Fornecedor não encontrado")
        }
    }


}