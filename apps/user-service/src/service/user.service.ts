import { queryUsers } from "../repository/user.repository";

export class UserService {
    async searchUsers(userId: string, query: string) {
        const result = await queryUsers(userId, query);
        return result.rows;
    }
}
