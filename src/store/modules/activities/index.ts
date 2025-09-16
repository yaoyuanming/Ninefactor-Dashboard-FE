import { defineStore } from 'pinia';

const activityStatusStore = defineStore('activity', {
  state: (): any => ({}),

  getters: {
    activities(state: any) {
      return { ...state };
    },
  },

  actions: {
    newActivitiesStatus(activityArray: any) {
      const objs = { ...this.$state };
      activityArray.forEach((element: any) => {
        if (!objs[element.subject]) {
          objs[element.subject] = 'visible';
        }
      });
      this.$patch(objs);
    },

    updataActivityStatus(activityId: string, status: 'hidden' | 'visible') {
      const objs = { ...this.$state };
      objs[activityId] = status;
      this.$patch(objs);
    },

    getActivityStatus(activityId: string) {
      console.log('this.$state', this.$state);
      return this.$state?.[activityId];
    },
  },
});

export default activityStatusStore;
