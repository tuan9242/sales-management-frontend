const { defineConfig } = require('@vue/cli-service');

// Proxy rules: route each /api prefix to the correct microservice
// (No unified gateway running — services exposed directly)
//
// Team 4 – Order Service  → localhost:5198
// Team 5 – Product Service → localhost:5002  (container port 80)
// Team 6 – User/Report API → localhost:5000
//
// Order matters: more specific paths must come before /api/Orders catch-all

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000,
    historyApiFallback: true,
    allowedHosts: 'all',
    proxy: {
      // Team 5 – Products, Categories, Stock
      '/api/products': { target: 'http://localhost:5002', changeOrigin: true },
      '/api/categories': { target: 'http://localhost:5002', changeOrigin: true },
      '/api/stock-receipts': { target: 'http://localhost:5002', changeOrigin: true },

      // Team 6 – Auth, Users, Reports, Webhook
      '/api/auth': { target: 'http://localhost:5000', changeOrigin: true },
      '/api/users': { target: 'http://localhost:5000', changeOrigin: true },
      '/api/reports': { target: 'http://localhost:5000', changeOrigin: true },
      '/api/events': { target: 'http://localhost:5000', changeOrigin: true },

      // Team 4 – Orders, Customers, Suppliers (catch-all last)
      '/api/Orders': { target: 'http://localhost:5198', changeOrigin: true },
      '/api/Customers': { target: 'http://localhost:5198', changeOrigin: true },
      '/api/Suppliers': { target: 'http://localhost:5198', changeOrigin: true },
      '/api/orders': { target: 'http://localhost:5198', changeOrigin: true },
      '/api/customers': { target: 'http://localhost:5198', changeOrigin: true },
    }
  }
});
