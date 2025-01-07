import jwt from "jsonwebtoken";
import prismaClient from "../utils/Database.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export async function authenticationMiddleware(req, res, next) {
  const authHeader = req.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const accessToken = authHeader.split(" ")[1];

  if (!accessToken) {
    return res.status(401).send({
      error: "Unauthorized",
    });
  }

  let payload;
  try {
    payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
  } catch (e) {
    return res.status(401).send({
      error: "Unauthorized",
    });
  }

  try {
    const targetedUser = await prismaClient.user.findFirst({
      where: {
        userId: payload.userId,
        accessToken: accessToken,
      },

      select: {
        userId: true,
        roleId: true,
        deletedAt: true,
      },
    });

    if (!targetedUser) {
      return res.status(401).send({
        error: "Unauthorized 3",
      });
    }

    if (targetedUser.deletedAt !== null) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
      });

      return res.status(401).send({
        error: "Unauthorized",
      });
    }

    req.user = {
      userId: targetedUser.userId,
      roleId: targetedUser.roleId,
    };
  } catch (e) {
    return res.status(500).send({
      error: "Internal server error",
    });
  }

  next();
}

export function authorizationMiddleware(permissionName) {
  return async (req, res, next) => {
    const roleId = req.user.roleId;

    try {
      const permission = await prismaClient.permission.findUnique({
        where: {
          name: permissionName,
        },
        select: {
          permissionId: true,
        },
      });

      if (!permission) {
        return res.status(401).send({
          error: "Unauthorized",
        });
      }

      const isRoleRelatedToPermission =
        await prismaClient.rolePermission.findFirst({
          where: {
            roleId: roleId,
            permissionId: permission.permissionId,
          },
        });

      if (!isRoleRelatedToPermission) {
        return res.status(401).send({
          error: "Unauthorized",
        });
      }
    } catch (e) {
      return res.status(500).send({
        error: "Internal server error",
      });
    }

    next();
  };
}
