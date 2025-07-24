/**
 * Utilidades para manejo de fechas en formato compatible con el backend
 */

/**
 * Convierte una fecha a formato YYYY-MM-DD (requerido por el backend)
 */
export const formatDateForBackend = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Convierte una fecha string del backend a formato legible en español
 */
export const formatDateForDisplay = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export const getCurrentDate = (): string => {
  return formatDateForBackend(new Date());
};

/**
 * Valida si una fecha está en formato YYYY-MM-DD
 */
export const isValidDateFormat = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
};
