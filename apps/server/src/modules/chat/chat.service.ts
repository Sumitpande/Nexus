import pool from "../../db/postgres";

import { Message } from "./chat.types";

const { v4: uuid } = require("uuid");
export async function isUserInConversation(
  userId: string,
  conversationId: string,
): Promise<boolean> {
  const res = await pool.query(
    `
    SELECT 1
    FROM conversation_members
    WHERE conversation_id = $1 AND user_id = $2
    `,
    [conversationId, userId],
  );

  return res.rowCount === 1;
}

export async function saveMessage({
  conversationId,
  senderId,
  content,
}: {
  conversationId: string;
  senderId: string;
  content: string;
}): Promise<Message> {
  const id = uuid();

  const res = await pool.query(
    `
    INSERT INTO messages (id, conversation_id, sender_id, content)
    VALUES ($1, $2, $3, $4)
    RETURNING id, conversation_id, sender_id, content, created_at
    `,
    [id, conversationId, senderId, content],
  );

  const row = res.rows[0];

  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at,
    type: "text",
  };
}

export async function createConversation(
  creatorId: string,
  userIds: string[],
): Promise<{ conversationId: string }> {
  const uniqueUserIds = Array.from(new Set(userIds)).filter(
    (id) => id !== creatorId,
  );

  if (uniqueUserIds.length === 0) {
    throw new Error("Cannot create conversation with yourself");
  }

  // DIRECT CONVERSATION
  if (uniqueUserIds.length === 1) {
    const otherUserId = uniqueUserIds[0];

    // Check if direct conversation already exists
    const existing = await pool.query(
      `
      SELECT c.id
      FROM conversations c
      JOIN conversation_members m1 ON m1.conversation_id = c.id
      JOIN conversation_members m2 ON m2.conversation_id = c.id
      WHERE c.type = 'direct'
        AND m1.user_id = $1
        AND m2.user_id = $2
      LIMIT 1
      `,
      [creatorId, otherUserId],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return { conversationId: existing.rows[0].id };
    }

    // Create new direct conversation
    return await createNewConversation("direct", creatorId, [
      creatorId,
      otherUserId,
    ]);
  }

  // GROUP CONVERSATION
  return await createNewConversation("group", creatorId, [
    creatorId,
    ...uniqueUserIds,
  ]);
}

async function createNewConversation(
  type: "direct" | "group",
  creatorId: string,
  memberIds: string[],
): Promise<{ conversationId: string }> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const convo = await client.query(
      `
      INSERT INTO conversations (type, created_by)
      VALUES ($1, $2)
      RETURNING id
      `,
      [type, creatorId],
    );

    const conversationId = convo.rows[0].id;

    await client.query(
      `
      INSERT INTO conversation_members (conversation_id, user_id, role)
      VALUES ($1, $2, $3)
      `,
      [conversationId, creatorId, "creator"],
    );
    const uniqueMembers = Array.from(
      new Set(memberIds.filter((id) => id !== creatorId)),
    );
    if (uniqueMembers.length > 0) {
      await client.query(
        `
        INSERT INTO conversation_members (conversation_id, user_id, role)
        SELECT $1, unnest($2::uuid[]), 'member'
        `,
        [conversationId, uniqueMembers],
      );
    }

    await client.query("COMMIT");

    return { conversationId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export const getConversationListForUser = async (userId: string) => {
  const result = await pool.query(
    `
   SELECT
      c.id AS conversation_id,
      c.type,
      c.created_at,

      gi.name AS group_name,
      gi.avatar AS group_avatar,

      m.content AS last_message,
      m.created_at AS last_message_time,

      json_agg(
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'role', cm.role
        )
      ) FILTER (WHERE u.id IS NOT NULL) AS participants

    FROM conversations c

    JOIN conversation_members cm_self
      ON cm_self.conversation_id = c.id
      AND cm_self.user_id = $1

    LEFT JOIN conversation_members cm
      ON cm.conversation_id = c.id

    LEFT JOIN users u
      ON u.id = cm.user_id

    LEFT JOIN LATERAL (
      SELECT content, created_at
      FROM messages
      WHERE conversation_id = c.id
        AND is_deleted = false
      ORDER BY created_at DESC
      LIMIT 1
    ) m ON true

    LEFT JOIN group_info gi
      ON gi.conversation_id = c.id

    GROUP BY
      c.id,
      gi.name,
      gi.avatar,
      m.content,
      m.created_at

    ORDER BY
      m.created_at DESC NULLS LAST,
      c.created_at DESC;

    `,
    [userId],
  );

  return result.rows.map((row) => {
    const participants = row.participants ?? [];

    let title = row.group_name;
    let avatar = row.group_avatar ?? null;
    if (row.type === "direct") {
      const otherUser = participants.find((p: any) => p.id !== userId);
      title = otherUser?.name ?? "Unknown User";
    }
    return {
      id: row.conversation_id,
      type: row.type,
      title,
      avatar,
      lastMessage: row.last_message,
      lastMessageTime: row.last_message_time,
      participants,
    };
  });
};
