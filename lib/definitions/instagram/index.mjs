export * from './const';

import { regularBrowsing } from './tasks/regularBrowsing';
import { followUser } from './tasks/followUser';

export const jobs = {
    regularBrowsing,
    followUser,
};
