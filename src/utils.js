export function timeToString(ms) {
    const secs = Math.floor(ms / 1000) % 60;
    const min = Math.floor(ms / 60 / 1000) % 60;
    const h = Math.floor(ms / 60 / 60 / 1000);

    return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

export function getTimerTime(timer) {
    let time = timer.length;

    if(timer.state === 1) {
      time = timer.length - ((Date.now() - timer.timestamp) + timer.duration);
    }
    if(timer.state === 0 && timer.duration > 0) {
      time = timer.length - timer.duration;
    }
    time = Math.max(time, 0);

    return time;
}

export function getArrayDiff(oldArray, newArray) {
  const deletedTimers = [];
  const addedTimers = [];

  for (let timer of oldArray) {
    const lokalTimer = newArray.find(t => t.id === timer.id);
    if (!lokalTimer) {
      addedTimers.push(timer);
    }
  }
  for (let timer of newArray) {
    const stateTimer = oldArray.find(t => t.id === timer.id);
    if (!stateTimer) {
      deletedTimers.push(timer);
    }
  }

  return [deletedTimers, addedTimers];
}
