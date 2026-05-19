const parseAppointmentDate = (dateValue) => {
  if (!dateValue) return null;

  const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    ));
  }

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatAppointmentDate = (dateValue) => {
  const date = parseAppointmentDate(dateValue);
  if (!date) return '';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

module.exports = {
  parseAppointmentDate,
  formatAppointmentDate,
};
