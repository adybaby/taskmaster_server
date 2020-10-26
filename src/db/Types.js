import Vacancy from './schema/Vacancy';
import Skill from './schema/Skill';
import Task from './schema/Task';
import Interest from './schema/Interest';
import ContributionLink from './schema/ContributionLink';
import User from './schema/User';
import { deleteTask, expandTask, prioritiseTasks } from './TaskActions';
import { deleteVacancy } from './VacancyActions';
import { deleteUser, expandUser } from './UserActions';

export const TYPES = {
  TASK: {
    id: 'task',
    deleteOne: deleteTask,
    expand: expandTask,
    postFetch: prioritiseTasks,
    entity: Task,
  },
  VACANCY: { id: 'vacancy', deleteOne: deleteVacancy, entity: Vacancy },
  SKILL: { id: 'skill', entity: Skill },
  INTEREST: { id: 'interest', entity: Interest },
  CONTRIBUTION_LINK: { id: 'contribution', entity: ContributionLink },
  USER: { id: 'user', deleteOne: deleteUser, expand: expandUser, entity: User },
};
