
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBills } from '../useBills';

// Mock dos hooks e dependências
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User' },
    authenticated: true,
  }),
  fetchWithAuth: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockFetchWithAuth = vi.fn();

describe('useBills Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchWithAuth.mockClear();
    
    // Reimport para pegar o mock atualizado
    vi.doMock('@/lib/auth', () => ({
      useAuth: () => ({
        user: { id: '1', name: 'Test User' },
        authenticated: true,
      }),
      fetchWithAuth: mockFetchWithAuth,
    }));
  });

  it('carrega bills corretamente', async () => {
    const mockBills = [
      {
        id: '1',
        description: 'Conta de luz',
        amount: 150.00,
        dueDate: '2024-12-31',
        category: 'Moradia',
        status: 'pending',
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        description: 'Internet',
        amount: 80.00,
        dueDate: '2024-12-25',
        category: 'Tecnologia',
        status: 'paid',
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    mockFetchWithAuth.mockResolvedValueOnce({
      json: async () => mockBills,
    });

    const { result } = renderHook(() => useBills());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.bills).toHaveLength(2);
    expect(result.current.bills[0]).toMatchObject({
      id: '1',
      description: 'Conta de luz',
      priority: 'high', // Deve calcular prioridade baseada na data
    });
  });

  it('calcula total a pagar corretamente', async () => {
    const mockBills = [
      {
        id: '1',
        description: 'Conta 1',
        amount: 100.00,
        status: 'pending',
        dueDate: '2024-12-31',
        category: 'Test',
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        description: 'Conta 2',
        amount: 50.00,
        status: 'pending',
        dueDate: '2024-12-31',
        category: 'Test',
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '3',
        description: 'Conta 3',
        amount: 75.00,
        status: 'paid',
        dueDate: '2024-12-31',
        category: 'Test',
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    mockFetchWithAuth.mockResolvedValueOnce({
      json: async () => mockBills,
    });

    const { result } = renderHook(() => useBills());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getTotalToPay()).toBe(150.00); // Apenas pending
    expect(result.current.getTotalPaid()).toBe(75.00); // Apenas paid
  });

  it('retorna bills a vencer ordenadas por data', async () => {
    const mockBills = [
      {
        id: '1',
        description: 'Vence depois',
        amount: 100.00,
        status: 'pending',
        dueDate: '2024-12-31',
        category: 'Test',
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        description: 'Vence primeiro',
        amount: 50.00,
        status: 'pending',
        dueDate: '2024-12-25',
        category: 'Test',
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '3',
        description: 'Já pago',
        amount: 75.00,
        status: 'paid',
        dueDate: '2024-12-20',
        category: 'Test',
        userId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    mockFetchWithAuth.mockResolvedValueOnce({
      json: async () => mockBills,
    });

    const { result } = renderHook(() => useBills());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const upcoming = result.current.getUpcomingBills();
    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].description).toBe('Vence primeiro');
    expect(upcoming[1].description).toBe('Vence depois');
  });
});
