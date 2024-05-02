import QueueEnvironment, { BaseQueue } from "./QueueEnvironment";

export default class Queue {
  public id: string;
  public environment: QueueEnvironment;
  public population: number = 0;
  public maxPopulation: number = Number.MAX_SAFE_INTEGER;
  public servers: number = -1;
  public minArrival: number = -1.0;
  public maxArrival: number = -1.0;
  public minDeparture: number = -1.0;
  public maxDeparture: number = -1.0;
  public destinations: Array<{ destination: Queue; probability: number; }> = [];
  public statistics: Map<number, number> = new Map();
  public lost: number = 0;

  constructor(id: string, env: QueueEnvironment, queueData: BaseQueue) {
    this.id = id;
    this.environment = env;
    this.applyQueueData(queueData);
  }

  private applyQueueData(queueData: BaseQueue) {
    this.maxPopulation = queueData.capacity ?? this.maxPopulation;
    this.servers = queueData.servers ?? this.servers;
    this.minArrival = queueData.minArrival ?? this.minArrival;
    this.maxArrival = queueData.maxArrival ?? this.maxArrival;
    this.minDeparture = queueData.minService ?? this.minDeparture;
    this.maxDeparture = queueData.maxService ?? this.maxDeparture;
  }

  getId(): string {
    return this.id;
  }

  in() {
    this.population++;
  }

  out() {
    this.population--;
  }

  loss() {
    this.lost++;
  }

  arrival(): void {
    this.environment.recordTime();
    if (this.population < this.maxPopulation) {
      this.in();
      if (this.population <= this.servers) {
        this.scheduleExit();
      }
    } else {
      this.loss();
    }

    this.environment.scheduleArrival(this);
  }

  departure(): void {
    this.environment.recordTime();
    this.out();
    if (this.population >= this.servers) {
      this.scheduleExit();
    }
  }

  passing(destination: Queue): void {
    this.environment.recordTime();
    this.out();
    if (this.population >= this.servers) {
      this.scheduleExit();
    }
    if (destination.population < destination.maxPopulation) {
      destination.in();
      if (destination.population <= destination.servers) {
        destination.scheduleExit();
      }
    } else {
      destination.loss();
    }
  }

  scheduleExit() {
    const destination = this.getDestination();
    if (destination) {
      this.environment.schedulePassing(this, destination);
    } else {
      this.environment.scheduleDeparture(this);
    }
  }

  addDestination(queue: Queue, probability: number): void {
    const destination: QueueDestination = {
      destination: queue,
      probability: probability,
    };
    this.destinations.push(destination);
    this.destinations.sort((a, b) => a.probability - b.probability);
  }

  getDestination(): Queue | null {
    if (this.destinations.length === 0) {
      return null;
    }

    let prob = this.environment.random.next();
    let sum = 0;
    for (const destination of this.destinations) {
      sum += destination.probability;
      if (prob < sum) {
        return destination.destination;
      }
    }
    return null;
  }

  getPopulation(): number {
    return this.population;
  }
}

interface QueueDestination {
  probability: number;
  destination: Queue;
}
