import { dashboard } from "../modules/dashboard/dashboard.js";
import { inventory } from "../modules/inventory/inventory.js";
import { expense } from "../modules/expense/expense.js";
import { sales } from "../modules/sales/sales.js";

export const routes = {
  home: {
    viewId: "dashboardView",
    onEnter: () => dashboard.onEnter(),
  },
  inventory: {
    viewId: "inventoryView",
    onEnter: () => inventory.onEnter(),
  },
  sales: {
    viewId: "salesView",
    onEnter: () => sales.onEnter(),
  },
  expense: {
    viewId: "expenseView",
    onEnter: () => expense.onEnter(),
  },
};
