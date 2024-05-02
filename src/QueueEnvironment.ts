import RandomGenerator from "./RandomGenerator";
import Queue from "./Queue";

interface Event {
  time: number;
  event: EventType;
  queue: Queue;
  destination?: Queue;
}

enum EventType {
  ARRIVAL,
  DEPARTURE,
  PASSING,
}

interface BaseDestination {
  source: string;
  target: string;
  probability: number;
}

export interface BaseQueue {
  capacity?: number;
  servers?: number;
  minArrival?: number;
  maxArrival?: number;
  minService?: number;
  maxService?: number;
}

export default class QueueEnvironment {
  events: Event[] = [];
  initialEvents: Event[] = [];
  random: RandomGenerator;
  time: number = 0.0;
  lastEventTime: number = 0.0;
  accumulatedTime: number = 0.0;
  queues: Map<string, Queue> = new Map();

  constructor({
    queues = {},
    network = [],
    arrivals = {},
    seed = 5,
    qtyOfRandomNumbers = 100_000,
  }: {
    queues: { [key: string]: BaseQueue };
    network: BaseDestination[];
    arrivals: { [key: string]: number };
    seed: number;
    qtyOfRandomNumbers: number;
  }) {
    for (const key in queues) {
      this.addQueue(new Queue(key, this, queues[key]));
    }

    for (const dest of network) {
      this.getQueue(dest.source)!.addDestination(
        this.getQueue(dest.target)!,
        dest.probability
      );
    }

    for (const name in arrivals) {
      this.scheduleArrival(this.getQueue(name)!, arrivals[name]);
    }

    this.random = new RandomGenerator(qtyOfRandomNumbers, seed);
  }

  recordTime(): void {
    for (const queue of this.queues.values()) {
      const population: number = queue.getPopulation();
      let subtotal: number = queue.statistics.get(population) || 0.0;
      subtotal += this.time - this.lastEventTime;
      queue.statistics.set(population, subtotal);
    }
    this.lastEventTime = this.time;
  }

  scheduleArrival(queue: Queue, delay?: number): Event {
    delay =
      delay ?? this.random.nextInRange(queue.minArrival, queue.maxArrival);
    const event: Event = {
      time: this.time + delay,
      event: EventType.ARRIVAL,
      queue: queue,
    };
    this.events.push(event);
    this.events.sort((a, b) => a.time - b.time);
    return event;
  }

  scheduleDeparture(queue: Queue): void {
    const event: Event = {
      time:
        this.time +
        this.random.nextInRange(queue.minDeparture, queue.maxDeparture),
      event: EventType.DEPARTURE,
      queue: queue,
    };
    this.events.push(event);
    this.events.sort((a, b) => a.time - b.time);
  }

  schedulePassing(queue: Queue, destination: Queue): void {
    const event: Event = {
      time:
        this.time +
        this.random.nextInRange(queue.minDeparture, queue.maxDeparture),
      event: EventType.PASSING,
      queue: queue,
      destination: destination,
    };
    this.events.push(event);
    this.events.sort((a, b) => a.time - b.time);
  }

  step(): void {
    const event: Event = this.events.shift()!;
    this.lastEventTime = this.time;
    this.time = event.time;
    if (event.event === EventType.ARRIVAL) {
      event.queue.arrival();
    } else if (event.event === EventType.DEPARTURE) {
      event.queue.departure();
    } else if (event.event === EventType.PASSING) {
      event.queue.passing(event.destination!);
    }
  }

  listQueues(): string[] {
    return Array.from(this.queues.keys());
  }

  addQueue(queue: Queue) {
    this.queues.set(queue.getId(), queue);
  }

  getQueue(id: string): Queue | undefined {
    return this.queues.get(id);
  }
}
