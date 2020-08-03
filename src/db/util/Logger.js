/* eslint-disable no-console */
import config from '../../config.json';

const DEBUG = config.debugLogging;

export const debug = (...objs) => {
  if (DEBUG) {
    console.log(...objs);
  }
};

export const error = (...objs) => {
  console.error(...objs);
};

export const log = (...objs) => {
  console.log(...objs);
};
