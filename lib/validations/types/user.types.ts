import { z } from "zod";
import {
  userLoginSchema,
  userRegistrationSchema,
  userUpdateSchema,
} from "../schemas/user.schema";

export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
