import bcrypt from "bcrypt"
import {prisma} from "../lib/prisma"

export const usersRepository = {
    create: async (data: { email: string; password: string; role: string}) => {
        const passwordHash = await bcrypt.hash(data.password, 10)

        return prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                role: data.role
            }
        })
    },

    findByEmail: async (email: string) => {
        return prisma.user.findUnique( {where: {email}})
    }
}