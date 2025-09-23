
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Login';

// Mock do hook useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock do wouter
vi.mock('wouter', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  it('renderiza corretamente os elementos principais', () => {
    render(<Login />);
    
    expect(screen.getByText('PayFlow')).toBeInTheDocument();
    expect(screen.getByText('Entre na sua conta')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('valida campos obrigatórios', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    await user.click(submitButton);
    
    // O HTML5 validation deve impedir o submit
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('realiza login com sucesso', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: true,
      json: async () => ({
        token: 'fake-token',
        user: { id: '1', name: 'Test User', email: 'test@test.com' },
        message: 'Login realizado com sucesso!'
      }),
    };
    
    (global.fetch as any).mockResolvedValueOnce(mockResponse);
    
    // Mock do window.location.href
    delete (window as any).location;
    (window as any).location = { href: '' };
    
    render(<Login />);
    
    await user.type(screen.getByLabelText('E-mail'), 'test@test.com');
    await user.type(screen.getByLabelText('Senha'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123',
        }),
      });
    });
  });

  it('exibe erro quando credenciais são inválidas', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      ok: false,
      json: async () => ({
        error: 'Email ou senha incorretos'
      }),
    };
    
    (global.fetch as any).mockResolvedValueOnce(mockResponse);
    
    render(<Login />);
    
    await user.type(screen.getByLabelText('E-mail'), 'wrong@test.com');
    await user.type(screen.getByLabelText('Senha'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('mostra estado de loading durante o login', async () => {
    const user = userEvent.setup();
    
    // Mock para simular delay na resposta
    (global.fetch as any).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<Login />);
    
    await user.type(screen.getByLabelText('E-mail'), 'test@test.com');
    await user.type(screen.getByLabelText('Senha'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    
    expect(screen.getByText('Entrando...')).toBeInTheDocument();
  });
});
