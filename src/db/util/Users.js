export const formatUserName = (user) => {
  const names = [user.firstNames[0]];
  if (user.firstNames.length > 1) {
    const initials = user.firstNames
      .slice(1, user.firstNames.length)
      .map((firstName) => firstName[0])
      .join('');
    names.push(initials);
  }
  names.push(user.lastName);
  return names.join(' ');
};
