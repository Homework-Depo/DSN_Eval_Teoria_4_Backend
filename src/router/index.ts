import { Express, Router } from "express";
import {
  registerRouter,
  loginRouter,
  logoutRouter,
  captchaRouter,
  sessionRouter,
  mainRouter
} from "../components";

const routesList: [string, Router][] = [
  ["/api/v1/register", registerRouter],
  ["/api/v1/login", loginRouter],
  ["/api/v1/logout", logoutRouter],
  ["/api/v1/captcha", captchaRouter],
  ["/api/v1/session", sessionRouter],
  ["/api/v1/", mainRouter]
];

export const routes = (app: Express) => {
  routesList.forEach(([path, controller]) => {
    app.use(path, controller);
  });
};