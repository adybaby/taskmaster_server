import { min, max } from 'date-fns';

export const formatDate = (date) => {
  if (date == null || date === '' || typeof date === 'string') return date;

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const inDay = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return isNaN(date.getTime()) ? date : `${inDay} ${monthNames[monthIndex]} ${year}`;
};

export const isValidDate = (date) =>
  date != null && date instanceof Date && date !== 'Invalid Date' && !isNaN(date);

export const first = (date1, date2) => {
  if (!isValidDate(date1) || !isValidDate(date2)) return null;
  return dateOnly(date1).getTime() <= dateOnly(date2).getTime() ? date1 : date2;
};

export const last = (date1, date2) => {
  if (!isValidDate(date1) || !isValidDate(date2)) return null;
  return dateOnly(date1).getTime() > dateOnly(date2).getTime() ? date1 : date2;
};

export const dateOnly = (date) => {
  if (!isValidDate(date)) return null;
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
};

export const firstLastDates = (tasks, users) => {
  const allDates = [
    ...tasks
      .filter((task) => task.type === 'INITIATIVE')
      .map((task) => [new Date(task.startDate), new Date(task.endDate)])
      .flat(),
    ...users
      .map((user) =>
        user.available.map((available) => [
          new Date(available.startDate),
          new Date(available.endDate),
        ])
      )
      .flat(2),
  ];

  return { first: min(allDates), last: max(allDates) };
};
