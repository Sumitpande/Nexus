import { getPool } from "@nexus/db";



export const isUserInConversation = async (userId: string, conversationId: string) => {
  const db = getPool()
  const res = await db.query(
    `
        SELECT 1
        FROM conversation_members
        WHERE conversation_id = $1 AND user_id = $2
        `,
    [conversationId, userId],
  );
  return res.rowCount === 1;
}

export const isReplyValid = async (conversationId: string, replyTo: string) => {
  const db = getPool()
  const res = await db.query(
    `
    SELECT 1 FROM messages    
    WHERE id = $1 AND conversation_id = $2
    `,
    [replyTo, conversationId],
  );
  return res.rowCount === 1;
}

export const addNewMessage = async (id: string, conversationId: string, senderId: string, content: string) => {
  const db = getPool()
  const res = await db.query(
    `
        INSERT INTO messages (id, conversation_id, sender_id, content)
        VALUES ($1, $2, $3, $4)
        RETURNING id, conversation_id, sender_id, content, created_at
    `,
    [id, conversationId, senderId, content],
  );
  return res.rows[0]
}


export const createNewConversation = async (
  type: "direct" | "group",
  creatorId: string,
  memberIds: string[],
): Promise<{ conversationId: string }> => {
  const db = getPool()
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const conversation = await client.query(
      `
                INSERT INTO conversations (type, created_by)
                VALUES ($1, $2)
                RETURNING id
            `,
      [type, creatorId],
    );

    const conversationId = conversation.rows[0].id;

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

export const getDirectConversation = async (memberId1: string, memberId2: string) => {
  const db = getPool()
  const res = await db.query(
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
    [memberId1, memberId2],
  );
  return res
}

export async function getConversationByIdForUser(
  conversationId: string,
  userId: string,
) {
  const db = getPool()
  const result = await db.query(
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

  return result
}

export const getUserConversationList = async (userId: string) => {
  const db = getPool()
  const result = await db.query(
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

  return result
};

export const getMessageById = async (id: String) => {
  const db = getPool()
  const res = await db.query(
    `
            SELECT 
            m.*,
            r.id AS reply_id,
            r.content AS reply_content,
            r.sender_id AS reply_sender
            FROM messages m
            LEFT JOIN messages r ON m.reply_to = r.id
            WHERE m.id = $1
        `,
    [id],
  );
  return res
}

export const createNewMessage = async (conversationId: string, senderId: string, content: string, replyTo: string | null, type: string) => {
  const db = getPool()
  const result = await db.query(
    `
        INSERT INTO messages (conversation_id, sender_id, content, reply_to, type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `,
    [conversationId, senderId, content, replyTo, type],
  );
  return result
}

export async function addMessageReaction(
  messageId: string,
  userId: string,
  emoji: string,
) {
  const db = getPool()
  const result = await db.query(
    `
    WITH inserted AS (
      INSERT INTO message_reactions (message_id, user_id, emoji)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
      RETURNING message_id, user_id, emoji
    )
    SELECT 
      m.conversation_id,
      i.message_id,
      i.user_id,
      i.emoji
    FROM inserted i
    JOIN messages m ON m.id = i.message_id
    `,
    [messageId, userId, emoji],
  );

  return result.rows[0]; // may be undefined if conflict
}

export async function removeMessageReaction(
  messageId: string,
  userId: string,
  emoji: string,
) {
  const db = getPool()
  const result = await db.query(
    `
        DELETE FROM message_reactions
        WHERE message_id = $1
          AND user_id = $2
          AND emoji = $3
        RETURNING message_id, user_id, emoji
    `,
    [messageId, userId, emoji],
  );
  return result
}

export const getConversationFromMessageId = async (messageId: string) => {
  const db = getPool()
  const conversation = await db.query(
    `SELECT conversation_id FROM messages WHERE id = $1`,
    [messageId],
  );
  return conversation
}

export async function getConversationMessages(
  conversationId: string,
  cursor: string | undefined,
  limit: number,
) {
  const db = getPool()

  const result = await db.query(
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

  return result; // ASC for UI
}