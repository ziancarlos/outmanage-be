import fs from "fs/promises";
import prismaClient from "../../src/utils/Database.js";

export default async function main() {
  const data = await fs.readFile("seeds/users/users.json", "utf-8");
  const { users } = JSON.parse(data);

  for (let { username, password } of users) {
    await prismaClient.user.create({
      data: {
        username,
        password,
        roleId: 1,
      },
    });
  }

  console.log("SUCCESSFULLY SEEDS USERS.");
}
