// routes.jsx
import React from "react"
const routes = [
  { path: "/stock", key: "stock", name: "stock", component: React.lazy(() => import("./views/stock")) },
   { path: "/history-sales", key: "history", name: "history", component: React.lazy(() => import("./views/history-sales")) },
   { path: "/history", key: "history", name: "history", component: React.lazy(() => import("./views/history")) },
  { path: "/promotion", key: "promotion", name: "promotion", component: React.lazy(() => import("./views/promotion")) },
  { path: "/site", key: "site", name: "site", component: React.lazy(() => import("./views/site")) },
  { path: "/product", key: "product", name: "product", component: React.lazy(() => import("./views/product")) },
  { path: "/project", key: "project", name: "project", component: React.lazy(() => import("./views/project")) },
  { path: "/lstm", key: "lstm", name: "lstm", component: React.lazy(() => import("./views/project")) },
  { path: "/smart-traffic", key: "smart-traffic", name: "smart-traffic", component: React.lazy(() => import("./views/smart-traffic")) },
  { path: "/permission", key: "permission", name: "permission", component: React.lazy(() => import("./views/permission")) },
  { path: "/user", key: "user", name: "user", component: React.lazy(() => import("./views/user")) },
  { path: "/", key: "home", name: "home", exact: true, component: React.lazy(() => import("./views/project/dashboard")) },
 

]
export default routes
