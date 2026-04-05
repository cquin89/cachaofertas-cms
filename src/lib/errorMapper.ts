import axios from 'axios';
import { toast } from 'sonner';
import type { UseFormSetError, FieldValues } from 'react-hook-form';

/**
 * Códigos de error del backend → mensajes en español.
 * Mantener sincronizado con la sealed class AppException del backend.
 */
const ERROR_MESSAGES: Record<string, string> = {
  // 400
  VALIDATION_ERROR:         'Hay errores en el formulario. Revisa los campos marcados.',
  DUPLICATE_DEAL:           'Esta oferta ya fue publicada. ¿Quizás quieres editarla?',
  INVALID_TOKEN:            'Token inválido. Inicia sesión nuevamente.',
  WEAK_PASSWORD:            'La contraseña es muy débil. Usa al menos 8 caracteres con letras y números.',
  // 401
  INVALID_CREDENTIALS:      'Email o contraseña incorrectos.',
  TOKEN_EXPIRED:             'Tu sesión expiró. Inicia sesión nuevamente.',
  UNAUTHORIZED:              'Debes iniciar sesión para continuar.',
  // 403
  FORBIDDEN:                 'No tienes permisos para realizar esta acción.',
  USER_BANNED:               'Tu cuenta ha sido suspendida. Contacta soporte.',
  INSUFFICIENT_PERMISSIONS:  'Tu rol no permite esta operación.',
  // 404
  NOT_FOUND:                 'El recurso solicitado no existe o fue eliminado.',
  USER_NOT_FOUND:            'El usuario no existe.',
  DEAL_NOT_FOUND:            'La oferta no existe.',
  // 409
  CONFLICT:                  'Ya existe un registro con ese dato. Verifica e intenta de nuevo.',
  EMAIL_ALREADY_EXISTS:      'Ya existe una cuenta con ese email.',
  USERNAME_TAKEN:            'Ese nombre de usuario ya está en uso.',
  SLUG_CONFLICT:             'Ya existe una página con ese slug.',
  // 422
  INVALID_STATUS_TRANSITION: 'No se puede cambiar al estado indicado desde el estado actual.',
  // 429
  RATE_LIMITED:              'Demasiadas solicitudes. Espera un momento antes de reintentar.',
  // 500
  INTERNAL_ERROR:            'Error interno del servidor. Intenta de nuevo en unos minutos.',
};

const FALLBACK_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo.';

/**
 * Extrae el mensaje amigable de un error Axios.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const code = error.response?.data?.errorCode as string | undefined;
    if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
    if (error.response?.data?.message) return error.response.data.message as string;
    if (error.code === 'ECONNABORTED') return 'La solicitud tardó demasiado. Verifica tu conexión.';
    if (!error.response) return 'Sin conexión con el servidor. Verifica tu red.';
  }
  return FALLBACK_MESSAGE;
}

/**
 * Para errores VALIDATION_ERROR con `details: Record<string, string>`,
 * mapea cada campo al error correspondiente en React Hook Form.
 */
export function mapValidationErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): boolean {
  if (!axios.isAxiosError(error)) return false;

  const data = error.response?.data as
    | { errorCode?: string; details?: Record<string, string> }
    | undefined;

  if (data?.errorCode !== 'VALIDATION_ERROR' || !data?.details) return false;

  Object.entries(data.details).forEach(([field, message]) => {
    setError(field as Parameters<UseFormSetError<T>>[0], {
      type: 'server',
      message,
    });
  });
  return true;
}

/**
 * Handler genérico para `onError` en useMutation.
 * Muestra toast con mensaje amigable. Si es validación, también setea errores en el form.
 */
export function handleMutationError<T extends FieldValues>(
  error: unknown,
  setError?: UseFormSetError<T>
) {
  if (setError && mapValidationErrors(error, setError)) {
    toast.error('Revisa los campos marcados en el formulario.');
    return;
  }
  toast.error(getErrorMessage(error));
}
