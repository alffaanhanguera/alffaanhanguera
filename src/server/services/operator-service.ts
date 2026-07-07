import { UserRole, UserStatus } from "@prisma/client";
import { OperatorRepository } from "@/server/repositories/operator-repository";

function formatRole(role: UserRole) {
  if (role === UserRole.ADMIN) {
    return "Administrador";
  }

  if (role === UserRole.SUPERVISOR) {
    return "Supervisor";
  }

  return "Operador";
}

function formatStatus(status: UserStatus) {
  if (status === UserStatus.ACTIVE) {
    return "Ativo";
  }

  if (status === UserStatus.INVITED) {
    return "Convidado";
  }

  return "Bloqueado";
}

export class OperatorService {
  constructor(private readonly repository = new OperatorRepository()) {}

  async getPanelData() {
    const users = await this.repository.listUsers();

    if (!users.length) {
      return {
        summary: {
          total: 3,
          admins: 1,
          supervisors: 1,
          operators: 1
        },
        users: [
          {
            id: "mock-admin",
            name: "Administrador",
            email: "admin@alffaeducacao.com",
            role: "Administrador",
            status: "Ativo",
            conversations: 6,
            permissions: ["dashboard:view", "conversation:manage", "settings:manage"]
          }
        ]
      };
    }

    return {
      summary: {
        total: users.length,
        admins: users.filter((user) => user.role === UserRole.ADMIN).length,
        supervisors: users.filter((user) => user.role === UserRole.SUPERVISOR).length,
        operators: users.filter((user) => user.role === UserRole.OPERATOR).length
      },
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: formatRole(user.role),
        status: formatStatus(user.status),
        conversations: user.ownedConversations.length,
        permissions: user.permissions.map((permission) => permission.permission.code)
      }))
    };
  }
}
