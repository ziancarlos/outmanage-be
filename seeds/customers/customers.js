import fs from "fs/promises";
import CustomerServices from "../../src/services/CustomerServices.js";

export default async function main() {
  const data = await fs.readFile("seeds/customers/customers.json", "utf-8");
  const { customers } = JSON.parse(data);

  for (let customer of customers) {
    await CustomerServices.create(
      {
        name: customer,
      },
      1
    );
  }

  console.log("SUCCESSFULLY SEEDS CUSTOMER.");
}
