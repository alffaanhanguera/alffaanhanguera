import { UserRole, UserStatus } from "@prisma/client";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export class OperatorRepository {
  async listUsers() {
    if (!isDatabaseConfigured()) {
      return [];
    }

    try {
      return await prisma.user.findMany({
        where: {
          role: {
            in: [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR]
          },
          status: {
            in: [UserStatus.ACTIVE, UserStatus.INVITED, UserStatus.BLOCKED]
          }
        },
        include: {
          permissions: {
            include: {
              permission: true
            }
          },
          ownedConversations: true
        },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }]
      });
    } catch {
      return [];
    }
  }
}
