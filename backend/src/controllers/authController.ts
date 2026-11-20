import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, WorkspaceModel, WorkspaceMemberModel, ProjectModel } from '../models';
import { AuthRequest } from '../middleware/auth';

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

const JWT_SECRET = process.env.JWT_SECRET || 'workspace-manager-jwt-super-secret-key-2026';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalizedEmail });

    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId('user');
    const avatarColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

    const user = await UserModel.create({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      avatarColor,
    });

    // Create default starter workspace
    const workspaceId = generateId('ws');
    await WorkspaceModel.create({
      id: workspaceId,
      name: `${name.trim()}'s Workspace`,
      description: 'Default personal workspace',
      icon: '🚀',
      color: '#6366f1',
      ownerId: userId,
      defaultView: 'kanban',
    });

    await WorkspaceMemberModel.create({
      id: generateId('wm'),
      workspaceId,
      userId,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    });

    // Create starter project
    await ProjectModel.create({
      id: generateId('proj'),
      workspaceId,
      name: 'Getting Started',
      description: 'Your first board',
      icon: '✨',
      color: '#3b82f6',
      status: 'active',
      defaultView: 'kanban',
      columns: [
        { id: 'col-backlog', title: 'Backlog', status: 'backlog', order: 0, color: '#94a3b8' },
        { id: 'col-todo', title: 'To Do', status: 'todo', order: 1, color: '#60a5fa' },
        { id: 'col-in-progress', title: 'In Progress', status: 'in-progress', order: 2, color: '#a78bfa' },
        { id: 'col-review', title: 'Review', status: 'review', order: 3, color: '#fb923c' },
        { id: 'col-done', title: 'Done', status: 'done', order: 4, color: '#34d399' },
      ],
      memberIds: [userId],
      createdBy: userId,
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error?.message || 'Server error during registration.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await UserModel.findOne({ email: normalizedEmail });

    const demoAccounts: Record<string, string> = {
      'alex@workspace.dev': 'password123',
      'sarah@workspace.dev': 'password123',
      'michael@workspace.dev': 'password123',
      'emma@workspace.dev': 'password123',
      'daniel@workspace.dev': 'password123',
    };

    if (!user && demoAccounts[normalizedEmail] && password === demoAccounts[normalizedEmail]) {
      const hashed = await bcrypt.hash(password, 10);
      user = await UserModel.create({
        id: `user-${Date.now().toString(36)}`,
        name: normalizedEmail.split('@')[0].toUpperCase(),
        email: normalizedEmail,
        password: hashed,
        avatarColor: '#6366f1',
      });
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch && demoAccounts[normalizedEmail] === password) {
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    } else if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        avatarColor: user.avatarColor,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error?.message || 'Server error during login.' });
  }
}

export async function socialLogin(req: Request, res: Response): Promise<void> {
  try {
    const { provider, email: inputEmail, name: inputName, avatarUrl } = req.body;
    const email = inputEmail || (provider === 'github' ? 'sarah@workspace.dev' : 'alex@workspace.dev');
    const name = inputName || (provider === 'github' ? 'Sarah Williams' : 'Alex Johnson');
    const normalizedEmail = email.toLowerCase().trim();

    let user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userId = generateId('user');
      const avatarColor = provider === 'github' ? '#ec4899' : '#6366f1';

      user = await UserModel.create({
        id: userId,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        avatarUrl: avatarUrl || '',
        avatarColor,
      });

      const workspaceId = generateId('ws');
      await WorkspaceModel.create({
        id: workspaceId,
        name: `${name}'s Workspace`,
        description: 'Personal team workspace',
        icon: '🚀',
        color: '#6366f1',
        ownerId: userId,
        defaultView: 'kanban',
      });

      await WorkspaceMemberModel.create({
        id: generateId('wm'),
        workspaceId,
        userId,
        role: 'owner',
        joinedAt: new Date().toISOString(),
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: `Signed in successfully via ${provider === 'github' ? 'GitHub' : 'Google'}`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        avatarColor: user.avatarColor,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Social login error:', error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await UserModel.findOne({ id: req.user.userId }).select('-password').lean();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, bio, avatarUrl } = req.body;
    const updated = await UserModel.findOneAndUpdate(
      { id: req.user.userId },
      { $set: { name, bio, avatarUrl } },
      { new: true }
    ).select('-password').lean();

    res.json({ user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Server error' });
  }
}
