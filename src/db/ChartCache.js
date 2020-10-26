import { createChartData, filterChartData } from './ChartActions';

let data = null;

export const populateChartCache = (entityCache) => {
  data = createChartData(entityCache);
};

export const getChartData = (filterDateRange) => filterChartData(data, filterDateRange);
