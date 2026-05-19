export const formatDateForApi = (date) => {
  if (!(date instanceof Date)) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getDateParts = (dateValue) => {
  if (!dateValue) return null;

  const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

export const formatAppointmentDate = (dateValue, options = {}) => {
  const parts = getDateParts(dateValue);
  if (!parts) return '';

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    ...options,
  }).format(date);
};

export const formatAppointmentDateLong = (dateValue) =>
  formatAppointmentDate(dateValue, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
