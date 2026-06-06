const routes = {
  home: {
    viewId: "homeView",
    onEnter: () => {
      loadDashboard();
    },
  },

  products: {
    viewId: "productsView",
    onEnter: () => {
      renderCachedProducts();
    },
  },

  expenses: {
    viewId: "expensesView",
    onEnter: () => {
      loadExpenseHeader(getCurrentMonthName());
    },
  },

  sales: {
    viewId: "salesView",
    onEnter: () => {
      loadSalesData(getCurrentMonthName());
    },
  },
};
