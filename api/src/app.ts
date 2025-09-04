import express from "express";
import "express-async-errors";
import cors from "cors";
import uploadConfig from "./configs/upload";

import { routes } from "./routes";
import { errorHandling } from "./middlewares/error-handling";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(uploadConfig.UPLOADS_FOLDER));

app.use(routes);
app.use(errorHandling);

export { app };
