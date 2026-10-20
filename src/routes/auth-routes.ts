import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { usersRepository } from "../repositories/users-repository";
import { errorSchema } from "./schemas";

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/login",
    {
      schema: {
        tags: ["auth"],
        body: {
          type: "object",
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
          required: ["email", "password"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string" },
            },
          },
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string };

      const user = await usersRepository.findByEmail(email);
      if (!user) {
        return reply.status(401).send({ message: "Credenciais inválidas" });
      }

      const senhaValida = await bcrypt.compare(password, user.passwordHash);
      if (!senhaValida) {
        return reply.status(401).send({ message: "Credenciais inválidas" });
      }

      const token = app.jwt.sign(
        { sub: user.id, role: user.role },
        { expiresIn: "8h" }
      );

      return reply.send({ token });
    }
  );
}