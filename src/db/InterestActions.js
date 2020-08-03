import { TYPES } from './Types';
import { formatUserName } from './util/Users';

export const expandInterest = (cache, interest) => {
  const user = cache.entities(TYPES.USER).find((user) => user.id === interest.userId);
  const userName = formatUserName(user);

  return {
    ...interest,
    user,
    userName,
  };
};
