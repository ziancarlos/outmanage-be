import fs from "fs/promises";
import prismaClient from "../../src/utils/Database.js";

export default async function main() {
  await seedsPermission();

  const roles = await prismaClient.role.findMany({
    where: {
      name: "Master",
    },
  });

  console.log(roles);

  for (let { roleId } of roles) {
    const permissions = await prismaClient.permission.findMany();

    for (let { permissionId } of permissions) {
      await prismaClient.rolePermission.create({
        data: {
          roleId: roleId,
          permissionId: permissionId,
        },
      });
    }
  }

  console.log("SUCCESSFULLY SEEDS PERMISSIONS.");
}

async function seedsPermission() {
  const data = await fs.readFile("seeds/permissions/permissions.json", "utf-8");
  const { permissions } = JSON.parse(data);

  for (let permission of permissions) {
    await prismaClient.permission.create({
      data: {
        name: permission,
      },
    });
  }
}
