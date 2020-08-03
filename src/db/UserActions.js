import { TYPES } from './Types';
import User from './schema/User';
import Interest from './schema/Interest';
import * as logger from './util/Logger';

export const expandUser = (cache, user) => ({
  ...user,
  skills: user.skills.map((userSkillId) => ({
    id: userSkillId,
    title: cache.entities(TYPES.SKILL).find((s) => s.id === userSkillId).title,
  })),
  authored: cache
    .entities(TYPES.TASK)
    .filter((t) => t.createdBy === user.id)
    .map((authoredTask) => ({
      id: authoredTask.id,
      title: authoredTask.title,
    })),
  signedUp: cache
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
    }),
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
