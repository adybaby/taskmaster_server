import { TYPES } from './Types';

const getContributionLinks = (
  taskId,
  taskType,
  thisTaskField,
  linkedTasksField,
  tasks,
  contributionLinks
) =>
  contributionLinks
    .filter((cl) => cl[thisTaskField] === taskId)
    .map((cl) => ({
      id: cl[linkedTasksField],
      title: tasks.find((t) => t.id === cl[linkedTasksField]).title,
      contribution: cl.contribution,
      contributorContributions:
        taskType === 'DRIVER'
          ? getContributionLinks(
              cl.contributorId,
              'ENABLER',
              'contributeeId',
              'contributorId',
              tasks,
              contributionLinks
            )
          : undefined,
    }));

const getContributions = (task, tasks, contributionLinks) => {
  return task.type !== 'INITIATIVE'
    ? getContributionLinks(
        task.id,
        task.type,
        'contributeeId',
        'contributorId',
        tasks,
        contributionLinks
      )
    : [];
};

const getContributesTo = (task, tasks, contributionLinks) => {
  return task.type !== 'DRIVER'
    ? getContributionLinks(
        task.id,
        task.type,
        'contributorId',
        'contributeeId',
        tasks,
        contributionLinks
      )
    : [];
};

export const getMap = (cache) => {
  const tasks = cache.entities(TYPES.TASK);
  const contributionLinks = cache.entities(TYPES.CONTRIBUTION_LINK);

  const tasksWithLinks = [];

  for (let index = 0; index < tasks.length; index++) {
    const task = tasks[index];
    tasksWithLinks.push({
      id: task.id,
      title: task.title,
      type: task.type,
      contributions: getContributions(task, tasks, contributionLinks),
      contributesTo: getContributesTo(task, tasks, contributionLinks),
    });
  }

  return tasksWithLinks;
};
