import { createPinia } from 'pinia';
import useAppStore from './modules/app';
import activityStatusStore from './modules/activities';

const pinia = createPinia();
export { useAppStore, activityStatusStore };
export default pinia;
