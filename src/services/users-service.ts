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
}

export const usersService = new UsersService();
