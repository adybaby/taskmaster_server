import { firstLastDates } from './util/Dates';
import { formatUserName } from './util/Users';
import { TYPES } from './Types';

export const INTEREST_STATUS = {
  CONTACTING: 'CONTACTING',
  APPLYING: 'APPLYING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
};

export const VACANCY_STATUS = {
  OPEN: 'Open',
  CLOSED: 'Closed',
};

const SUBJECTS = ['vacancies', 'availability', 'signedUp', 'actualAvailability', 'shortfall'];

const createChartDataTemplate = (skills, dateRange) => {
  const dataTemplate = [];

  const createCountsTemplate = () => {
    const counts = {};
    skills.forEach((skill) => {
      counts[skill.id] = 0;
    });
    return counts;
  };

  const createSubjectTemplate = () => ({
    participants: [],
    total: 0,
    skillCounts: createCountsTemplate(),
  });

  const createDayTemplate = (date) => {
    const dayTemplate = { date };
    SUBJECTS.forEach((subject) => {
      dayTemplate[subject] = createSubjectTemplate();
    });
    return dayTemplate;
  };

  for (
    let i = new Date(dateRange.first);
    i.getTime() <= new Date(dateRange.last).getTime();
    i.setDate(i.getDate() + 1)
  ) {
    dataTemplate.push(createDayTemplate(i.getTime()));
  }

  return dataTemplate;
};

const addParticipant = (data, range, participant, subject) => {
  const startIndex = data.findIndex((day) => day.date === new Date(range.startDate).getTime());
  const endIndex = data.findIndex((day) => day.date === new Date(range.endDate).getTime());

  for (let index = startIndex; index <= endIndex; index++) {
    const currentDay = data[index][subject];
    currentDay.participants.push(participant);
    currentDay.total++;
    participant.skills.forEach((skill) => {
      currentDay.skillCounts[skill.id]++;
    });
  }
};

const populateVacancies = (data, vacancies, tasks, skills) => {
  vacancies
    .filter((vacancy) => vacancy.status === VACANCY_STATUS.OPEN)
    .forEach((vacancy) => {
      addParticipant(
        data,
        vacancy,
        {
          taskId: vacancy.taskId,
          taskTitle: tasks.find((task) => task.id === vacancy.taskId).title,
          skills: [
            {
              id: vacancy.skillId,
              title: skills.find((skill) => skill.id === vacancy.skillId).title,
            },
          ],
          startDate: vacancy.startDate,
          endDate: vacancy.endDate,
        },
        'vacancies'
      );
    });
};

const populateAvailability = (data, users, skills) => {
  users
    .filter((user) => user.available.length > 0 && user.skillIds.length > 0)
    .forEach((user) => {
      const userName = formatUserName(user);
      user.available.forEach((available) => {
        addParticipant(
          data,
          available,
          {
            userId: user.id,
            userName,
            skills: user.skillIds.map((skillId) => ({
              id: skillId,
              title: skills.find((skill) => skill.id === skillId).title,
            })),
            startDate: available.startDate,
            endDate: available.endDate,
          },
          'availability'
        );
      });
    });
};

const populateSignedUp = (data, interests, users, vacancies, tasks, skills) => {
  interests
    .filter((interest) => interest.status === INTEREST_STATUS.ACCEPTED)
    .forEach((interest) => {
      const user = users.find((u) => u.id === interest.userId);
      const vacancy = vacancies.find((vacancy) => vacancy.id === interest.vacancyId);
      const task = tasks.find((t) => t.id === vacancy.taskId);
      addParticipant(
        data,
        interest,
        {
          userId: user.id,
          userName: formatUserName(user),
          taskId: task.id,
          taskTitle: task.title,
          skills: [
            {
              id: vacancy.skillId,
              title: skills.find((skill) => skill.id === vacancy.skillId).title,
            },
          ],
          startDate: interest.startDate,
          endDate: interest.endDate,
        },
        'signedUp'
      );
    });
};

const populateActualAvailabilityAndShortFall = (calendar, skills) => {
  calendar.forEach((day) => {
    day.availability.participants.forEach((user) => {
      if (day.signedUp.participants.find((signUp) => signUp.userId === user.userId) == null) {
        day.actualAvailability.participants.push(user);
        day.actualAvailability.total++;
        user.skills.forEach((userSkill) => {
          day.actualAvailability.skillCounts[userSkill.id]++;
        });
      }
      day.shortfall.total = day.vacancies.total - day.actualAvailability.total;
      day.shortfall.participants = day.vacancies.participants;
      skills.forEach((skill) => {
        day.shortfall.skillCounts[skill.id] =
          day.vacancies.skillCounts[skill.id] - day.actualAvailability.skillCounts[skill.id];
      });
    });
  });
};

/**
Returned data structure:
[date: int(milliseconds),
 [subjectName]: {
    participants:[{
      userId:str, 
      userName:str, 
      taskId:str, 
      taskName:str, 
      skills:[{id, title}], 
      skillName, 
      startDate, 
      endDate
    }],
    total:int,
    skillCounts:{skillId:int, skillId:int,..}
  }
]
**/
export const createChartData = (cache) => {
  const data = createChartDataTemplate(
    cache.entities(TYPES.SKILL),
    firstLastDates(cache.entities(TYPES.TASK), cache.entities(TYPES.USER))
  );
  populateVacancies(
    data,
    cache.entities(TYPES.VACANCY),
    cache.entities(TYPES.TASK),
    cache.entities(TYPES.SKILL)
  );
  populateAvailability(data, cache.entities(TYPES.USER), cache.entities(TYPES.SKILL));
  populateSignedUp(
    data,
    cache.entities(TYPES.INTEREST),
    cache.entities(TYPES.USER),
    cache.entities(TYPES.VACANCY),
    cache.entities(TYPES.TASK),
    cache.entities(TYPES.SKILL)
  );
  populateActualAvailabilityAndShortFall(data, cache.entities(TYPES.SKILL));
  return data;
};

export const filterChartData = (data, filterDateRange) => {
  console.log(filterDateRange);
  let startIndex = 0;
  let endIndex = data.length;

  if (filterDateRange != null) {
    if (filterDateRange.startDate != null) {
      const selectedStartDate = new Date(filterDateRange.startDate).getTime();
      if (selectedStartDate > data[data.length - 1].date) {
        return [];
      }
      let selectedStartIndex = data.findIndex((day) => day.date === selectedStartDate);
      if (selectedStartIndex != -1) {
        startIndex = selectedStartIndex;
      }
    }
    if (filterDateRange.endDate != null) {
      const selectedEndDate = new Date(filterDateRange.endDate).getTime();
      if (selectedEndDate < data[0].date) {
        return [];
      }
      let selectedEndIndex = data.findIndex((day) => day.date === selectedEndDate);
      if (selectedEndIndex != -1) {
        endIndex = selectedEndIndex + 1;
      }
    }
  }

  return data.slice(startIndex, endIndex);
};
