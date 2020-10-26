import { TYPES } from './Types';
import User from './schema/User';
import Interest from './schema/Interest';
import * as logger from './util/Logger';
import { formatUserName } from './util/Users';

const getActions = (cache, user) => {
  const actions = [];

  cache
    .entities(TYPES.VACANCY)
    .filter((v) => v.recruiterId === user.id)
    .forEach((vacancy) => {
      cache
        .entities(TYPES.INTEREST)
        .filter(
          (i) => i.vacancyId === vacancy.id && i.status !== 'ACCEPTED' && i.status !== 'DECLINED'
        )
        .forEach((interestForVacancy) => {
          const interestedUser = cache
            .entities(TYPES.USER)
            .find((u) => u.id === interestForVacancy.userId);
          const skill = cache.entities(TYPES.SKILL).find((s) => s.id === vacancy.skillId);
          const interestedInTask = cache.entities(TYPES.TASK).find((t) => t.id === vacancy.taskId);
          const status =
            interestForVacancy.status === 'APPLYING'
              ? 'has applied for'
              : 'wants to speak to you about';
          const vacancyInfo = 'the ' + skill.title + ' role for ' + interestedInTask.title;
          const description = formatUserName(interestedUser) + ' ' + status + ' ' + vacancyInfo;
          actions.push({ taskId: vacancy.taskId, description });
        });
    });
  return actions;
};

const getPOCs = (cache, user) =>
  cache
    .entities(TYPES.VACANCY)
    .filter((v) => v.recruiterId === user.id)
    .reduce((pocTasks, vacancy) => {
      const pocTask = {
        id: vacancy.taskId,
        title: cache.entities(TYPES.TASK).find((t) => t.id === vacancy.taskId).title,
      };
      if (!pocTasks.find((t) => t.id === pocTask.id)) {
        return [...pocTasks, pocTask];
      } else {
        return pocTasks;
      }
    }, []);

const getSignedUp = (cache, user) =>
  cache
    .entities(TYPES.INTEREST)
    .filter((i) => i.userId === user.id)
    .map((thisInterest) => {
      const interestedInVacancy = cache
        .entities(TYPES.VACANCY)
        .find((vacancy) => vacancy.id === thisInterest.vacancyId);
      const interestedInTask = cache
        .entities(TYPES.TASK)
        .find((t) => t.id === interestedInVacancy.taskId);
      const skillTitle = cache
        .entities(TYPES.SKILL)
        .find((s) => s.id === interestedInVacancy.skillId).title;
      return {
        id: interestedInTask.id,
        title: interestedInTask.title,
        skillTitle,
        startDate: thisInterest.startDate,
        endDate: thisInterest.endDate,
      };
    });

export const expandUser = (cache, user) => ({
  ...user,
  skills: user.skillIds.map((userSkillId) => {
    const skill = cache.entities(TYPES.SKILL).find((s) => s.id === userSkillId);
    return {
      id: userSkillId,
      title: skill.title,
    };
  }),
  authored: cache
    .entities(TYPES.TASK)
    .filter((t) => t.createdBy === user.id)
    .map((authoredTask) => ({
      id: authoredTask.id,
      title: authoredTask.title,
    })),
  signedUp: getSignedUp(cache, user),
  actions: getActions(cache, user),
  poc: getPOCs(cache, user),
});

export const deleteUser = (cache, id) =>
  new Promise((resolve, reject) => {
    Promise.all([User.deleteOne({ id }), Interest.deleteMany({ userId: id })])
      .then(() => {
        cache.refresh(
          TYPES.USER,
          cache.entities(TYPES.USER).filter((u) => u.id !== id)
        );
        cache.refresh(
          TYPES.INTEREST,
          cache.entities(TYPES.INTEREST).filter((i) => i.userId !== id)
        );
        resolve();
      })
      .catch((e) => {
        logger.error(e);
        reject(new Error('Could not delete user with id ' + id));
      });
  });
