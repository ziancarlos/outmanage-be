import fs from "fs/promises";
import ItemServices from "../../src/services/ItemServices.js";

export default async function main() {
  const data = await fs.readFile("seeds/items/items.json", "utf-8");
  const { items } = JSON.parse(data);

  for (let item of items) {
    await ItemServices.create(
      {
        name: item,
      },
      1
    );
  }

  console.log("SUCCESSFULLY SEEDS ITEM.");
}
