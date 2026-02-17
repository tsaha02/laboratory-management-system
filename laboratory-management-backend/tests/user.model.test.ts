// tests/user.model.test.ts
import User from '../src/models/user.model';
import db from '../src/db';

describe('User Model', () => {
  beforeEach(async () => {
    await db('users').del();
    await db('users').insert({
      full_name: 'Test User',
      email: 'test.user@test.com',
      password: 'hashedpassword',
      role: 'patient',
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should fetch all users from the database', async () => {
    const users = await User.findAll();
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('test.user@test.com');
  });

  it('should find a user by email', async () => {
    const user = await User.findByEmail('test.user@test.com');
    expect(user).toBeDefined();
    expect(user.full_name).toBe('Test User');
    expect(user.role).toBe('patient');
  });
});
