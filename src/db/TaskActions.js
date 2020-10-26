import { TYPES } from './Types';
import Task from './schema/Task';
import Vacancy from './schema/Vacancy';
import Interest from './schema/Interest';
import ContributionLink from './schema/ContributionLink';
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

const formatPriority = (task) => {
  const ordinal = (i) => {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + 'st';
    }
    if (j == 2 && k != 12) {
      return i + 'nd';
    }
    if (j == 3 && k != 13) {
      return i + 'rd';
    }
    return i + 'th';
  };

  const camel = (s) => s.charAt(0).toUpperCase() + s.toLowerCase().slice(1);

  return ordinal(task.priority) + ' ' + camel(task.type);
};

export const summariseTask = (cache, task) => {
  const summary = [
    ' (ID:' +
      task.id +
      ', Priority: ' +
      formatPriority(task) +
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

  if (requiredSkills.length !== 0) {
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
        $or: cache.entities(TYPES.VACANCY).map((v) => ({ vacancyId: v.id })),
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
              ...cache.entities(TYPES.INTEREST),
            ])
        );
        resolve();
      })
      .catch((e) => {
        logger.error(e);
        reject(new Error('Could not delete task with id ' + id + '. ' + e.message));
      });
  });

export const prioritiseTasks = (cache, tasks) => {
  const CONTRIBUTION_MULTIPLIERS = {
    Minor: { multiplier: 11, displayName: 'Partial Contributor' },
    DeRisking: { multiplier: 12, displayName: 'Derisking Contributor' },
    Major: { multiplier: 15, displayName: 'Major Contributor' },
  };

  const scoresByType = {
    DRIVER: { parentType: null, scores: {} },
    ENABLER: { parentType: 'DRIVER', scores: {} },
    INITIATIVE: { parentType: 'ENABLER', scores: {} },
  };

  const calcScore = (task) => {
    let score = task.score != null ? task.score : 0;

    const scoresForType = scoresByType[task.type];
    const parent = scoresByType[scoresForType.parentType];

    if (parent != null) {
      cache
        .entities(TYPES.CONTRIBUTION_LINK)
        .filter((contirbutionLink) => contirbutionLink.contributorId === task.id)
        .forEach((contributesTo) => {
          score +=
            parent.scores[contributesTo.contributeeId] *
            CONTRIBUTION_MULTIPLIERS[contributesTo.contribution].multiplier;
        });
    }
    scoresForType.scores[task.id] = score;
  };

  const calcPriorities = (type) => {
    tasks
      .filter((task) => task.type === type)
      .forEach((task) => {
        calcScore(task);
      });

    return Object.entries(scoresByType[type].scores)
      .sort((a, b) => b[1] - a[1])
      .map((entry, index) => ({ id: entry[0], priority: index + 1 }));
  };

  const order = calcPriorities('DRIVER');
  order.push(...calcPriorities('ENABLER'));
  order.push(...calcPriorities('INITIATIVE'));

  return tasks.map((task) => ({ ...task, priority: order.find((o) => o.id === task.id).priority }));
};
