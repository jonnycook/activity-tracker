import { formatDuration } from './util';
import Sugar from 'sugar';

export var activityTotalTime = {
  prop: 'activityTotalTime',
  requires: [ { collection: 'instances' }, 'now' ],
  get(instances, now, activity) {
    // return new Date().getTime();
    var totalActivityTime = {};
    for (let instance of instances.filter(instance => {
      return Sugar.Date.isBetween(Sugar.Date.create(instance.start), Sugar.Date.beginningOfDay(new Date(now)), Sugar.Date.endOfDay(new Date(now)));
    })) {
      if (!totalActivityTime[instance.activity._id]) {
        totalActivityTime[instance.activity._id] = 0;
      }
      totalActivityTime[instance.activity._id] += (instance.end ? Sugar.Date.create(instance.end) : now).getTime() - Sugar.Date.create(instance.start).getTime();
    }

    var totalTime;
    if (totalActivityTime[activity._id]) {
      totalTime = formatDuration(totalActivityTime[activity._id]);          
    }
    else {
      let mostRecent;
      for (let instance of instances) {
        if (instance.activity._id == activity._id) {
          if (!mostRecent || instance.end && mostRecent < instance.end) {
            mostRecent = instance.end;
          }
        }
      }
      totalTime = mostRecent ? Sugar.Date.relative(Sugar.Date.create(mostRecent)) : 'never';
    }

    return totalTime;
  }
}


export var categoryTotalTime = {
  prop: 'categoryTotalTime',
  requires: [ { collection: 'activities' }, { collection: 'instances' }, 'now' ],
  get(activities, instances, now, category) {
    // return new Date().getTime();
    // console.log(now, category);
    var totalActivityTime = {};
    for (let instance of instances.filter(instance => {
      return Sugar.Date.isBetween(Sugar.Date.create(instance.start), Sugar.Date.beginningOfDay(new Date(now)), Sugar.Date.endOfDay(new Date(now)));
    })) {
      if (!totalActivityTime[instance.activity._id]) {
        totalActivityTime[instance.activity._id] = 0;
      }
      totalActivityTime[instance.activity._id] += (instance.end ? Sugar.Date.create(instance.end) : now).getTime() - Sugar.Date.create(instance.start).getTime();
    }

    var totalTime;
    totalTime = 0;
    for (let activity of activities) {
      if (activity.category == category) {
        totalTime += totalActivityTime[activity._id] || 0;
      }
    }
    if (totalTime) {
      totalTime = formatDuration(totalTime)
    }
    else {
      let mostRecent;
      for (let activity of activities) {
        if (activity.category == category) {
          for (let instance of instances) {
            if (instance.activity._id == activity._id) {
              if (!mostRecent || instance.end && mostRecent < instance.end) {
                mostRecent = instance.end;
              }
            }
          }
        }
      }
      if (mostRecent) {
        totalTime = Sugar.Date.relative(Sugar.Date.create(mostRecent));            
      }
      else {
        totalTime = 'never';
      }
    }

    return totalTime;
  }
}

export var routineTime = {
  prop: 'routineTime',
  requires: [ { collection: 'instances' }, 'now' ],
  get(instances, now, routine) {
    // return new Date().getTime();
    var time;
    var totalActivityTime = {};
    for (let instance of instances.filter(instance => {
      return Sugar.Date.isBetween(Sugar.Date.create(instance.start), Sugar.Date.beginningOfDay(new Date(now)), Sugar.Date.endOfDay(new Date(now)));
    })) {
      if (!totalActivityTime[instance.activity._id]) {
        totalActivityTime[instance.activity._id] = 0;
      }
      totalActivityTime[instance.activity._id] += (instance.end ? Sugar.Date.create(instance.end) : now).getTime() - Sugar.Date.create(instance.start).getTime();
    }

    let totalTime = 0;

    for (let activity of routine.activities) {
      totalTime += totalActivityTime[activity._id] || 0;
    }

    if (totalTime) {
      time = formatDuration(totalTime);
    }
    else {
      let mostRecent;
      for (let activity of routine.activities) {
          for (let instance of instances) {
            if (instance.activity._id == activity._id) {
              if (!mostRecent || instance.end && mostRecent < instance.end) {
                mostRecent = instance.end;
              }
            }
          }
      }
      if (mostRecent) {
        time = Sugar.Date.relative(Sugar.Date.create(mostRecent));            
      }
      else {
        time = 'never';
      }
    }
    return time;
  }
}
