import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { routes } from "./router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://3.94.173.130:5173',
  credentials: true
}));
app.use(morgan("dev"));

routes(app);

export default app;