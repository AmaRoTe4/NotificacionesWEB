import cron from "node-cron";

//a 30 segundo
export default ({ timer, funcion }) => cron.schedule(timer, funcion);
