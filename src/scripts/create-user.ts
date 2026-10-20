import { prisma } from "../lib/prisma";
import { usersRepository } from "../repositories/users-repository";

const ROLES_VALIDOS = ["admin", "analyst", "viewer"];

async function main() {
  const [, , email, password, role] = process.argv;

  if (!email || !password || !role) {
    console.error(
      "Uso: bun run src/scripts/create-user.ts <email> <password> <role>",
    );
    process.exit(1);
  }

  if (!ROLES_VALIDOS.includes(role)) {
    console.error(`Role inválido. Use um destes: ${ROLES_VALIDOS.join(", ")}`);
    process.exit(1);
  }

  try {
    const user = await usersRepository.create({ email, password, role });

    console.log("Usuário criado:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(
      "Não foi possível criar o usuário. O email pode já estar cadastrado.",
    );
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
