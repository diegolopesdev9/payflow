
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import routes from '../routes';
import { storage } from '../storage';

// Mock do storage
vi.mock('../storage', () => ({
  storage: {
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    getUser: vi.fn(),
    getBills: vi.fn(),
    createBill: vi.fn(),
    updateBill: vi.fn(),
    deleteBill: vi.fn(),
    getBill: vi.fn(),
  },
}));

// Mock do auth
vi.mock('../auth', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
  verifyPassword: vi.fn(),
  generateToken: vi.fn().mockReturnValue('fake_token'),
  authenticateToken: vi.fn(),
  loginAttempts: {
    isBlocked: vi.fn().mockReturnValue(false),
    recordAttempt: vi.fn(),
    getRemainingTime: vi.fn().mockReturnValue(0),
  },
  registerSchema: {
    parse: vi.fn(),
  },
  loginSchema: {
    parse: vi.fn(),
  },
}));

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('cria usuário com sucesso', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock das dependências
      (storage.getUserByEmail as any).mockResolvedValueOnce(null);
      (storage.createUser as any).mockResolvedValueOnce(mockUser);
      
      const { registerSchema } = await import('../auth');
      (registerSchema.parse as any).mockReturnValueOnce({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });

      const response = await request(routes.fetch as any)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@test.com',
        },
        token: 'fake_token',
        message: 'Conta criada com sucesso!',
      });
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('retorna erro quando email já existe', async () => {
      const existingUser = {
        id: '1',
        name: 'Existing User',
        email: 'test@test.com',
        passwordHash: 'hashed_password',
      };

      (storage.getUserByEmail as any).mockResolvedValueOnce(existingUser);
      
      const { registerSchema } = await import('../auth');
      (registerSchema.parse as any).mockReturnValueOnce({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });

      const response = await request(routes.fetch as any)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email já está em uso');
    });
  });

  describe('POST /api/auth/login', () => {
    it('realiza login com sucesso', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        passwordHash: 'hashed_password',
      };

      (storage.getUserByEmail as any).mockResolvedValueOnce(mockUser);
      
      const { loginSchema, verifyPassword } = await import('../auth');
      (loginSchema.parse as any).mockReturnValueOnce({
        email: 'test@test.com',
        password: 'password123',
      });
      (verifyPassword as any).mockResolvedValueOnce(true);

      const response = await request(routes.fetch as any)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@test.com',
        },
        token: 'fake_token',
        message: 'Login realizado com sucesso!',
      });
    });

    it('retorna erro para credenciais inválidas', async () => {
      (storage.getUserByEmail as any).mockResolvedValueOnce(null);
      
      const { loginSchema } = await import('../auth');
      (loginSchema.parse as any).mockReturnValueOnce({
        email: 'wrong@test.com',
        password: 'wrongpassword',
      });

      const response = await request(routes.fetch as any)
        .post('/api/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email ou senha incorretos');
    });
  });

  describe('GET /api/bills', () => {
    it('retorna bills do usuário autenticado', async () => {
      const mockBills = [
        {
          id: '1',
          description: 'Conta de luz',
          amount: 150.00,
          dueDate: '2024-12-31',
          category: 'Moradia',
          status: 'pending',
          userId: '1',
        },
      ];

      (storage.getBills as any).mockResolvedValueOnce(mockBills);

      // Mock do middleware de autenticação
      const { authenticateToken } = await import('../auth');
      (authenticateToken as any).mockReturnValueOnce({ userId: '1' });

      const response = await request(routes.fetch as any)
        .get('/api/bills')
        .set('Authorization', 'Bearer fake_token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBills);
      expect(storage.getBills).toHaveBeenCalledWith('1');
    });

    it('retorna erro sem token de autenticação', async () => {
      const { authenticateToken } = await import('../auth');
      (authenticateToken as any).mockReturnValueOnce(null);

      const response = await request(routes.fetch as any)
        .get('/api/bills');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token de acesso inválido ou expirado');
    });
  });

  describe('POST /api/bills', () => {
    it('cria nova bill com sucesso', async () => {
      const mockBill = {
        id: '1',
        description: 'Nova conta',
        amount: 100.00,
        dueDate: '2024-12-31',
        category: 'Test',
        status: 'pending',
        userId: '1',
      };

      (storage.createBill as any).mockResolvedValueOnce(mockBill);

      const { authenticateToken } = await import('../auth');
      (authenticateToken as any).mockReturnValueOnce({ userId: '1' });

      const response = await request(routes.fetch as any)
        .post('/api/bills')
        .set('Authorization', 'Bearer fake_token')
        .send({
          description: 'Nova conta',
          amount: 100.00,
          dueDate: '2024-12-31',
          category: 'Test',
          status: 'pending',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockBill);
    });
  });
});
