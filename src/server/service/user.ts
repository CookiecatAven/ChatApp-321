import {executeSQL} from '../database';

interface User {
  id: string;
  name: string;
  picture?: string;
}

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await executeSQL('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  if (!result || result.length === 0) {
    return null;
  }
  return {
    id: result[0].id.toString(),
    name: result[0].name,
    picture: result[0].picture
  };
};

export const storeUser = async (user: User): Promise<User | null> => {
  try {
    await executeSQL('INSERT INTO users (id, name, picture) VALUES (?, ?, ?)', [user.id, user.name, user.picture ?? 'null']);
    return await getUserById(user.id);
  } catch {
    return null;
  }
};

export const updateUserName = async (id: string, newName: string): Promise<User | null> => {
  try {
    await executeSQL('UPDATE users SET name = ? WHERE id = ?', [newName, id]);
    return await getUserById(id);
  } catch {
    return null;
  }
};
