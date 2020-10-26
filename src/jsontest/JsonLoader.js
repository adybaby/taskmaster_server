import tasksFile from './tasks.json';
import usersFile from './users.json';
import contributionLinksFile from './contribution_links.json';
import vacanciesFile from './vacancies.json';
import interestFile from './interest.json';
import skillsFile from './skills.json';
import { TYPES } from '../db/Types';

const jsonFile = {
  [TYPES.TASK.id]: tasksFile,
  [TYPES.VACANCY.id]: vacanciesFile,
  [TYPES.SKILL.id]: skillsFile,
  [TYPES.INTEREST.id]: interestFile,
  [TYPES.CONTRIBUTION_LINK.id]: contributionLinksFile,
  [TYPES.USER.id]: usersFile,
};

export const resetTypeToJsonFile = (type, upsertCallBack) =>
  type == null
    ? Promise.resolve('No type given')
    : Promise.all(
        jsonFile[type.id].map((jsonRecord) => {
          upsertCallBack(
            {
              createdDate: new Date(),
              modifiedDate: new Date(),
              createdBy: '1',
              modifiedBy: '1',
              ...jsonRecord,
            },
            type
          );
        })
      );
