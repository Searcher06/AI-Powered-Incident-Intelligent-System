import EventEmitter from 'events';

class ReportQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
  }

  enqueue(reportId) {
    this.queue.push(reportId);
    this.emit('enqueue');
  }

  dequeue() {
    return this.queue.shift();
  }

  size() {
    return this.queue.length;
  }
}

const singletonQueue = new ReportQueue();
export default singletonQueue;
