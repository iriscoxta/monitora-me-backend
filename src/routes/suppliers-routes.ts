import { FastifyInstance } from "fastify";
import { suppliersService } from "../services/suppliers-service";
import { stringify } from "node:querystring";
import { REPL_MODE_SLOPPY } from "node:repl";

export async function suppliersRoutes(app: FastifyInstance){
    app.get("/suppliers",
        {
            schema: {
                tags: ["suppliers"],
                response: {
                    200: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: {type: "string"},
                                name: {type: "string"},
                                porte: {type: "string"},
                            }
                        }
                    }
                }
            }
        },
        
        async (request, reply) => {
        const suppliers = await suppliersService.listSuppliers();
        return reply.send(suppliers)
    })

    // rota dinâmica
    app.get("/suppliers/:id", 
        {
            schema: {
                tags: ["suppliers"],
                params: {
                    type: "object",
                    properties: {
                        id: {type: "string"}
                    },
                    required: ["id"]
                },
            },
        },
        //  as {id: string}
        
        async (request, reply) => {
        const { id } = request.params as {id: string}

        try{
            const supplier = await suppliersService.getSupplierById(id)
            return reply.send(supplier)
        } catch (error){
            return reply.status(404).send({ message: (error as Error).message})
        }
    })

    app.post("/suppliers",
        {
            schema: {
                tags: ["suppliers"],
                body: {
                    type: "object",
                    properties: {
                        name: {type: "string"},
                        porte: {type: "string"},
                    },
                    required: ["name", "porte"]
                },
            },
        } ,
        
        async (request, reply) => {
        const body = request.body as {name: string; porte: string; cnpj: string}

        try{
            const newSupplier = await suppliersService.createSupplier(body)
            return reply.status(201).send(newSupplier)
        } catch (error) {
            return reply.status(400).send( {message: (error as Error).message})
        }
    })

    app.patch(
        "/suppliers/:id",
        {
            schema: {
                tags: ["suppliers"],
                params: {
                    type: "object",
                    properties: { id: {type: "string"}},
                    required: ["id"],
                },
                body: {
                    type: "object",
                    properties: {
                        name: {type: "string"},
                        cnpj: {type: "string"},
                        porte: {type: "string"},
                    }
                }
            }
        },
        async (request, reply) => {
            const {id} = request.params as {id: string};
            const body = request.body as Partial<{name: string; cnpj: string; porte: string}>;

            try{
                const updated = await suppliersService.updateSupplier(id, body);
                return reply.send(updated)
            }catch(error){
                return reply.status(404).send( { message: (error as Error).message})
            }
        }
    )

    app.delete(
        "/suppliers/:id",
        {
            schema: {
                tags: ["suppliers"],
                params: {
                    type: "object",
                    properties: {id: {type: "string"}},
                    required: ["id"]
                }
            }
        },
        async(request, reply) => {
            const { id } = request.params as {id: string}

            try{
                await suppliersService.deleteSupplier(id)
                return reply.status(204).send()
            }catch (error){
                return reply.status(404).send({ message: (error as Error).message})
            }
        }
    )
}
    
