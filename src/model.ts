import { formatDuration } from './util';
import Sugar from 'sugar';

export function routineTime(dataFrame, routine) {
  var [instances] = dataFrame.collections(['instances']);
  var time;
  var totalActivityTime = {};
  for (let instance of instances.filter(instance => {
    return Sugar.Date.isBetween(Sugar.Date.create(instance.start), Sugar.Date.beginningOfDay(new Date()), Sugar.Date.endOfDay(new Date()));
  })) {
    if (!totalActivityTime[instance.activity._id]) {
      totalActivityTime[instance.activity._id] = 0;
    }
    totalActivityTime[instance.activity._id] += (instance.end ? Sugar.Date.create(instance.end) : new Date()).getTime() - Sugar.Date.create(instance.start).getTime();
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

export function activityTotalTime(dataFrame, activity) {
  var totalActivityTime = {};
  var [instances] = dataFrame.collections(['instances']);
  for (let instance of instances.filter(instance => {
    return Sugar.Date.isBetween(Sugar.Date.create(instance.start), Sugar.Date.beginningOfDay(new Date()), Sugar.Date.endOfDay(new Date()));
  })) {
    if (!totalActivityTime[instance.activity._id]) {
      totalActivityTime[instance.activity._id] = 0;
    }
    totalActivityTime[instance.activity._id] += (instance.end ? Sugar.Date.create(instance.end) : new Date()).getTime() - Sugar.Date.create(instance.start).getTime();
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

export function categoryTotalTime(dataFrame, category) {
  var totalActivityTime = {};
  var [activities, instances] = dataFrame.collections(['activities', 'instances']);
  for (let instance of instances.filter(instance => {
    return Sugar.Date.isBetween(Sugar.Date.create(instance.start), Sugar.Date.beginningOfDay(new Date()), Sugar.Date.endOfDay(new Date()));
  })) {
    if (!totalActivityTime[instance.activity._id]) {
      totalActivityTime[instance.activity._id] = 0;
    }
    totalActivityTime[instance.activity._id] += (instance.end ? Sugar.Date.create(instance.end) : new Date()).getTime() - Sugar.Date.create(instance.start).getTime();
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
