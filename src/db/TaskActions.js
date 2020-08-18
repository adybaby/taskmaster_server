import { TYPES } from './Types';
import Task from './schema/Task';
import Vacancy from './schema/Vacancy';
import Interest from './schema/Interest';
import { expandVacancy } from './VacancyActions';
import { formatDate } from './util/Dates';
import { capitalize } from './util/String';
import { formatUserName } from './util/Users';
import * as logger from './util/Logger';

const getRequiredSkills = (cache, task) => {
  const vacancies = cache.entities(TYPES.VACANCY).filter((v) => v.taskId === task.id);
  if (vacancies.length !== 0) {
    return [
      ...new Set(
        vacancies.map((vacancy) =>
          cache.entities(TYPES.SKILL).find((s) => s.id === vacancy.skillId)
        )
      ),
    ];
  }
  return [];
};

export const expandTask = (cache, task) => {
  const getLinks = (taskId, firstField, secondField) =>
    cache
      .entities(TYPES.CONTRIBUTION_LINK)
      .filter((c) => c[firstField] === taskId)
      .map((c) => {
        const linkedTask = cache.entities(TYPES.TASK).find((t) => t.id === c[secondField]);
        return {
          _id: c.id,
          id: linkedTask.id,
          title: linkedTask.title,
          type: linkedTask.type,
          contribution: c.contribution,
        };
      });

  return {
    ...task,
    createdByName: formatUserName(cache.entities(TYPES.USER).find((u) => u.id === task.createdBy)),
    modifiedByName: formatUserName(
      cache.entities(TYPES.USER).find((u) => u.id === task.modifiedBy)
    ),
    requiredSkills: getRequiredSkills(cache, task),
    vacancies: cache
      .entities(TYPES.VACANCY)
      .filter((v) => v.taskId === task.id)
      .map((v) => expandVacancy(cache, v)),
    contributions: getLinks(task.id, 'contributeeId', 'contributorId'),
    contributesTo: getLinks(task.id, 'contributorId', 'contributeeId'),
    editorNames: task.editors.map((id) => ({
      id,
      userName: formatUserName(cache.entities(TYPES.USER).find((u) => u.id === id)),
    })),
  };
};

export const summariseTask = (cache, task) => {
  const summary = [
    task.type +
      ' (ID:' +
      task.id +
      ', Priority: ' +
      task.priority +
      ') created by ' +
      formatUserName(cache.entities(TYPES.USER).find((user) => user.id === task.createdBy)) +
      ' on ' +
      formatDate(task.createdDate) +
      ' (last modified on ' +
      formatDate(task.modifiedDate) +
      ' by ' +
      formatUserName(cache.entities(TYPES.USER).find((user) => user.id === task.modifiedBy)) +
      ')',
  ];

  if (task.startDate != null) {
    summary.push(
      'Starting on ' +
        formatDate(task.startDate) +
        ' and ending on ' +
        formatDate(task.endDate) +
        '.'
    );
  }

  const requiredSkills = getRequiredSkills(cache, task);

  if (requiredSkills !== 0) {
    summary.push('Vacancies: ' + requiredSkills.map((rs) => capitalize(rs.title)).join(', '));
  }

  if (task.tags != null && task.tags.length > 0) {
    summary.push('Tags: ' + task.tags.map((tag) => capitalize(tag)).join(', '));
  }

  return {
    id: task.id,
    startDate: task.startDate,
    endDate: task.endDate,
    createDate: task.createDate,
    priority: task.priority,
    title: task.title,
    type: task.type,
    createdBy: task.createdBy,
    createdDate: task.createdDate,
    shortDescription: task.shortDescription,
    summary,
  };
};

export const deleteTask = (cache, id) =>
  new Promise((resolve, reject) => {
    Promise.all([
      Task.deleteOne({ id }),
      Vacancy.deleteMany({ taskId: id }),
      Interest.deleteMany({
        $or: cache[TYPES.VACANCY].entities.map((v) => ({ vacancyId: v.id })),
      }),
      ContributionLink.deleteMany({
        $or: [{ contibutorId: id }, { contributeeId: id }],
      }),
    ])
      .then(() => {
        cache.refresh(
          TYPES.TASK,
          cache.entities(TYPES.TASK).filter((t) => t.id !== id)
        );
        cache.refresh(
          TYPES.VACANCY,
          cache.entities(TYPES.VACANCY).filter((v) => v.taskId !== id)
        );
        cache.refresh(
          TYPES.INTEREST,
          cache
            .entities(TYPES.VACANCY)
            .filter((v) => v.taskId === id)
            .reduce((newInterests, v) => newInterests.filter((i) => i.vacancyId !== v.id), [
              ...cache.entities(TYPES.INTEREST).entities,
            ])
        );
        resolve();
      })
      .catch((e) => {
        logger.error(e);
        reject(new Error('Could not delete task with id ' + id));
      });
  });
