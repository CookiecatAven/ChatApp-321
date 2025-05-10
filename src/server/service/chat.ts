import {executeSQL} from '../database';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

interface ChatMessage {
  id: number;
  userId: string;
  message: string;
  timestamp: Date;
  userName: string;
  userPicture?: string;
}

/**
 * Gets all chat messages from the database
 */
export async function getAllMessages(): Promise<ChatMessage[]> {
  try {
    const results = await executeSQL(`SELECT m.id,
                                             m.user_id,
                                             m.message,
                                             m.created,
                                             u.name    AS user_name,
                                             u.picture AS user_picture
                                      FROM messages m
                                             JOIN users u ON m.user_id = u.id
                                      ORDER BY m.created`
    );
    return results.map((row: any) => ({
      id: row.id,
      userId: row.user_id.toString(),
      message: row.message,
      timestamp: dayjs.utc(row.created).toISOString(),
      userName: row.user_name,
      userPicture: row.user_picture
    }));
  } catch (error) {
    console.error('Failed to get all messages from database:', error);
    return [];
  }
}

/**
 * Writes a chat message to the database
 */
export async function writeChatMessageToDB(userId: string, message: string): Promise<true | null> {
  try {
    await executeSQL('INSERT INTO messages (user_id, message) VALUES (?, ?)', [userId, message]);
    return true;
  } catch (error) {
    return null;
  }
}