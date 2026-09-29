import { Router } from "express";
import { login } from "./auth.controller.js";
import { validateBody } from "#http/middlewares/validateRequest.js";
import { LoginUser } from "./auth.schemas.js";
const router = Router();

router.post("/login", validateBody(LoginUser), login);

export default router;
