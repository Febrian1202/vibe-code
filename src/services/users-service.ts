import bcrypt from 'bcrypt';
import { db } from '../db';
import { users, session } from '../db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export class UsersService {
  /**
   * Register a new user
   * @param payload User data (name, email, password)
   */
  async registerUser(payload: any) {
    const { name, email, password } = payload;

    // 1. Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Email sudah terdaftar');
    }

    // 2. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Insert new user
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return { data: 'OK' };
  }

  /**
   * Login user
   * @param payload Login data (email, password)
   */
  async loginUser(payload: any) {
    const { email, password } = payload;

    // 1. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error('Email atau password salah');
    }

    // 2. Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Email atau password salah');
    }

    // 3. Generate token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    // 4. Save session
    await db.insert(session).values({
      token,
      userId: user.id,
      expiresAt: expiresAt,
    });

    return { data: token };
  }

  /**
   * Get user by token
   * @param token Session token
   */
  async getCurrentUser(token: string) {
    const [result] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(session)
      .innerJoin(users, eq(session.userId, users.id))
      .where(eq(session.token, token))
      .limit(1);

    if (!result) {
      throw new Error('Unauthorized');
    }

    return result;
  }

  /**
   * Logout user by deleting their session
   * @param token Session token
   */
  async logoutUser(token: string) {
    const [result] = await db.delete(session).where(eq(session.token, token));

    if (result.affectedRows === 0) {
      throw new Error('Unauthorized');
    }

    return { data: 'OK' };
  }
}

export const usersService = new UsersService();
