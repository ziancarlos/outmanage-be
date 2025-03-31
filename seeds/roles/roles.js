import fs from "fs/promises";
import prismaClient from "../../src/utils/Database.js";

export default async function main() {
  const data = await fs.readFile("seeds/roles/roles.json", "utf-8");
  const { roles } = JSON.parse(data);

  for (let role of roles) {
    await prismaClient.role.create({
      data: {
        name: role,
      },
    });
  }

  console.log("SUCCESSFULLY SEEDS ROLES.");
}
