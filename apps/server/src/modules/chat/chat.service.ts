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
  // Verify user is part of conversation
  const member = await pool.query(
    `
    SELECT 1 FROM conversation_members
    WHERE conversation_id = $1 AND user_id = $2
    `,
    [conversationId, senderId],
  );
  if (member.rowCount === 0) {
    throw new Error("Not a member of conversation");
  }
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

export async function createConversation(creatorId: string, userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds)).filter(
    (id) => id !== creatorId,
  );

  if (uniqueUserIds.length === 0) {
    throw new Error("Cannot create conversation with yourself");
  }

  let conversationId: string;

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
      conversationId = existing.rows[0].id;
    } else {
      // Create new direct conversation
      const created = await createNewConversation("direct", creatorId, [
        creatorId,
        otherUserId,
      ]);
      conversationId = created.conversationId;
    }
  } else {
    // GROUP CONVERSATION
    const created = await createNewConversation("group", creatorId, [
      creatorId,
      ...uniqueUserIds,
    ]);
    conversationId = created.conversationId;
  }

  const conversation = await getConversationByIdForUser(
    conversationId,
    creatorId,
  );
  return conversation;
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

    let title =
      row.group_name ?? participants.map((p: any) => p.name).join(", ");
    let avatar = row.group_avatar ?? "";
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

export async function getConversationByIdForUser(
  conversationId: string,
  userId: string,
) {
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
      AND cm_self.user_id = $2

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

    WHERE c.id = $1

    GROUP BY
      c.id,
      gi.name,
      gi.avatar,
      m.content,
      m.created_at
    `,
    [conversationId, userId],
  );

  if (result.rowCount === 0) return null;

  return normalizeConversationRow(result.rows[0], userId);
}

function normalizeConversationRow(row: any, userId: string) {
  const participants = row.participants ?? [];

  let title = row.group_name ?? participants.map((p: any) => p.name).join(", ");
  let avatar = row.group_avatar ?? "";

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
}

export async function createMessage(
  conversationId: string,
  senderId: string,
  content: string,
  replyTo: string | null = null,
  type: "text" | "system" = "text",
) {
  if (replyTo) {
    await validateReply(conversationId, replyTo);
  }

  // Verify user is part of conversation
  const member = await pool.query(
    `
    SELECT 1 FROM conversation_members
    WHERE conversation_id = $1 AND user_id = $2
    `,
    [conversationId, senderId],
  );

  if (member.rowCount === 0) {
    throw new Error("Not a member of conversation");
  }

  // Save message
  const result = await pool.query(
    `
    INSERT INTO messages (conversation_id, sender_id, content, reply_to, type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [conversationId, senderId, content, replyTo, type],
  );

  return result.rows[0];
}

async function validateReply(conversationId: string, replyTo: string) {
  const res = await pool.query(
    `
    SELECT 1 FROM messages    
    WHERE id = $1 AND conversation_id = $2
    `,
    [replyTo, conversationId],
  );

  if (res.rowCount === 0) {
    throw new Error("Reply to message not found");
  }
}

export async function addReaction(
  messageId: string,
  userId: string,
  emoji: string,
) {
  await pool.query(
    `
    INSERT INTO message_reactions (message_id, user_id, emoji)
    VALUES ($1, $2, $3)
    ON CONFLICT DO NOTHING
    `,
    [messageId, userId, emoji],
  );
}
export async function removeReaction(
  messageId: string,
  userId: string,
  emoji: string,
) {
  await pool.query(
    `
    DELETE FROM message_reactions
    WHERE message_id = $1 AND user_id = $2 AND emoji = $3
    `,
    [messageId, userId, emoji],
  );
}

export async function getMessages(
  conversationId: string,
  userId: string,
  cursor: string | undefined,
  limit: number,
) {
  // Verify user is part of conversation
  const member = await pool.query(
    `
    SELECT 1 FROM conversation_members
    WHERE conversation_id = $1 AND user_id = $2
    `,
    [conversationId, userId],
  );
  if (member.rowCount === 0) {
    throw new Error("Not a member of conversation");
  }

  const result = await pool.query(
    `
    SELECT
      m.id,
      m.conversation_id,
      m.sender_id,
      m.content,
      m.created_at,
      m.type,
      m.reply_to,

      r.id AS reply_id,
      r.content AS reply_content,
      r.sender_id AS reply_sender,

      mr.emoji,
      mr.user_ids

    FROM messages m

    LEFT JOIN messages r
      ON m.reply_to = r.id

    LEFT JOIN (
      SELECT
        message_id,
        emoji,
        json_agg(user_id) AS user_ids
      FROM message_reactions
      GROUP BY message_id, emoji
    ) mr
      ON mr.message_id = m.id

    WHERE m.conversation_id = $1
      AND m.is_deleted = false
      AND ($2::timestamptz IS NULL OR m.created_at < $2)

    ORDER BY m.created_at DESC
    LIMIT $3
    `,
    [conversationId, cursor ?? null, limit],
  );

  return mapMessages(result.rows).reverse(); // ASC for UI
}

function mapMessages(rows: any[]) {
  const map = new Map<string, any>();

  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        content: row.content,
        timestamp: row.created_at,
        type: row.type,
        replyTo: row.reply_id
          ? {
              id: row.reply_id,
              content: row.reply_content,
              senderId: row.reply_sender,
            }
          : null,
        reactions: [],
      });
    }

    if (row.emoji) {
      map.get(row.id).reactions.push({
        emoji: row.emoji,
        userIds: row.user_ids,
      });
    }
  }

  return Array.from(map.values());
}
