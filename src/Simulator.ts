import QueueEnvironment from "./QueueEnvironment";
import Queue from "./Queue";
import { readFileSync } from "fs";

function formatTableHeader() {
  console.log("------------------------------------------------------");
  console.log("|     State   |        Time        |    Probability    |");
  console.log("------------------------------------------------------");
}

function formatTableRow(state: string, time: number, probability: number) {
  const statePadded = state.padStart(10);
  const timeFormatted = time.toFixed(4).padStart(18);
  const probabilityFormatted = `${probability.toFixed(2)}%`.padStart(16);
  console.log(`| ${statePadded} | ${timeFormatted} | ${probabilityFormatted} |`);
}

try {
  const parameters = JSON.parse(readFileSync("./model.json", "utf8"));
  const environment: QueueEnvironment = new QueueEnvironment(parameters);

  while (environment.random.hasNext()) {
    environment.step();
  }

  console.log("\nSimulation Results:\n");

  for (const queueId of environment.listQueues()) {
    const queue: Queue = environment.getQueue(queueId)!;
    console.log(`Queue: ${queue.getId()} (Servers: ${queue.servers})`);
    console.log(`Arrival Time: ${queue.minArrival} - ${queue.maxArrival}`);
    console.log(`Service Time: ${queue.minDeparture} - ${queue.maxDeparture}`);
    
    formatTableHeader();
    queue.statistics.forEach((time, state) => {
      const probability = (time / (environment.time + environment.accumulatedTime)) * 100;
      formatTableRow(state.toString(), time, probability);
    });

    console.log("------------------------------------------------------");
    console.log(`Losses: ${queue.lost}\n`);
  }

  console.log(`Total Simulation Time: ${environment.time + environment.accumulatedTime}`);
} catch (error) {
  console.error("An error occurred during simulation:", error);
}
