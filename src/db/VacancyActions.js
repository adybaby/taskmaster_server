import Vacancy from './schema/Vacancy';
import Interest from './schema/Interest';
import { TYPES } from './Types';
import { expandInterest } from './InterestActions';
import * as logger from './util/Logger';

export const expandVacancy = (cache, vacancy) => {
  if (cache.entities(TYPES.SKILL).find((s) => s.id === vacancy.skillId) == null) {
    const msg = 'No skill for vacancy. Looking for skill ' + vacancy.skillId;
    console.error(msg, vacancy);
    reject(new Error(msg));
  }
  return {
    ...vacancy,
    recruiter: cache.entities(TYPES.USER).find((u) => u.id === vacancy.recruiterId),
    skillTitle: cache.entities(TYPES.SKILL).find((s) => s.id === vacancy.skillId).title,
    taskTitle: cache.entities(TYPES.TASK).find((t) => t.id === vacancy.taskId).title,
    interest: cache
      .entities(TYPES.INTEREST)
      .filter((i) => i.vacancyId === vacancy.id)
      .map((i) => expandInterest(cache, i)),
  };
};

export const deleteVacancy = (cache, id) =>
  new Promise((resolve, reject) => {
    Promise.all([Vacancy.deleteOne({ id }), Interest.deleteMany({ vacancyId: id })])
      .then(() => {
        cache.refresh(
          TYPES.VACANCY,
          cache.entities(TYPES.VACANCY).filter((v) => v.id !== id)
        );
        cache.refresh(
          TYPES.INTEREST,
          cache.entities(TYPES.INTEREST).filter((i) => i.vacancyId !== id)
        );
        resolve();
      })
      .catch((e) => {
        logger.error('Could not delete vacancy with id ' + id, e);
        reject(e);
      });
  });
