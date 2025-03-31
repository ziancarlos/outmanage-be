import RoleSeed from "../seeds/roles/roles.js";
import PermissionSeed from "../seeds/permissions/permissions.js";
import CustomerSeed from "../seeds/customers/customers.js";
import ItemSeed from "../seeds/items/items.js";
import UserSeed from "../seeds/users/users.js";

async function main() {
  await RoleSeed();
  await PermissionSeed();
  await UserSeed();
  await CustomerSeed();
  await ItemSeed();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
