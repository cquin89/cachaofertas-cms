import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flame, Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { getErrorMessage } from '@/lib/errorMapper';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { ROUTES } from '@/config/routes';
import type { ApiResponse } from '@/types';
import type { AuthUser } from '@/stores/authStore';

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

async function loginRequest(data: LoginFormData): Promise<LoginResponse> {
  const res = await axios.post<ApiResponse<LoginResponse>>(
    `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
    data
  );
  return res.data.data;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const { resolvedTheme } = useThemeStore();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ??
        ROUTES.DASHBOARD;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      toast.success(`Bienvenido, ${data.user.displayName}`);
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ??
        ROUTES.DASHBOARD;
      navigate(from, { replace: true });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const code = error.response?.data?.errorCode as string | undefined;
        if (code === 'INVALID_CREDENTIALS') {
          setError('email', { message: ' ' });
          setError('password', { message: 'Email o contraseña incorrectos.' });
          return;
        }
      }
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = handleSubmit((data) => mutation.mutate(data));

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-surface-background px-4"
      data-theme={resolvedTheme}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 shadow-lg">
            <Flame size={28} className="text-white" />
          </span>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-warm-900">
              Cacha<span className="text-primary-500">Ofertas</span>
            </h1>
            <p className="mt-0.5 text-sm font-medium text-warm-400">
              Panel de administración
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-warm-200 bg-surface-card px-8 py-8 shadow-lg">
          <h2 className="mb-1 font-display text-lg font-bold text-warm-900">
            Iniciar sesión
          </h2>
          <p className="mb-6 text-sm text-warm-400">
            Ingresa con tu cuenta de administrador
          </p>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-warm-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@cachaofertas.cl"
                error={!!errors.email}
                leftIcon={<Mail size={14} />}
                {...register('email')}
              />
              {errors.email?.message && errors.email.message.trim() && (
                <FieldError message={errors.email.message} />
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-warm-700">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={!!errors.password}
                leftIcon={<Lock size={14} />}
                {...register('password')}
              />
              {errors.password?.message && (
                <FieldError message={errors.password.message} />
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="mt-2 w-full"
              loading={mutation.isPending}
            >
              Iniciar sesión
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-warm-400">
          CachaOfertas CMS · Solo acceso autorizado
        </p>
      </div>
    </div>
  );
}

/* ── Helper ── */
function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1 text-xs text-danger-600">
      <AlertCircle size={12} className="shrink-0" />
      {message}
    </p>
  );
}
