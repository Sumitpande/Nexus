import { Request, Response, NextFunction } from "express";
import { searchUserSchema } from "./user.validation";
import { UserService } from "../service/user.service";

const userService = new UserService();

export async function searchUsers(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { q } = searchUserSchema.parse(req.query);
        const userId = (req as any).userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const users = await userService.searchUsers(userId, q);
        res.json(users);
    } catch (error) {
        next(error);
    }
}
