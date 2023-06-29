import { Express, Router } from "express";
import {
  registerRouter,
  loginRouter,
  logoutRouter
} from "../components";

const routesList: [string, Router][] = [
  ["/api/v1/register", registerRouter],
  ["/api/v1/login", loginRouter],
  ["/api/v1/logout", logoutRouter]
];

export const routes = (app: Express) => {
  routesList.forEach(([path, controller]) => {
    app.use(path, controller);
  });
};