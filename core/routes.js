import { dashboard } from "../modules/dashboard/dashboard.js";
import { inventory } from "../modules/inventory/inventory.js";
import { expense } from "../modules/expense/expense.js";
import { sales } from "../modules/sales/sales.js";

export const routes = {
  home: {
    viewId: "viewDashboard",
    onEnter: () => dashboard.onEnter(),
  },
  inventory: {
    viewId: "viewInventory",
    onEnter: () => inventory.onEnter(),
  },
  expense: {
    viewId: "expensesView",
    onEnter: () => expense.onEnter(),
  },
  sales: {
    viewId: "salesView",
    onEnter: () => sales.onEnter(),
  },
};
