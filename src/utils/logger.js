import chalk from 'chalk';
import moment from 'moment';

const logger = {
    info: (msg) => console.log(`${chalk.gray(moment().format('HH:mm:ss'))} ${chalk.blue('[INFO]')} ${msg}`),
    success: (msg) => console.log(`${chalk.gray(moment().format('HH:mm:ss'))} ${chalk.green('[SUCCESS]')} ${msg}`),
    warn: (msg) => console.log(`${chalk.gray(moment().format('HH:mm:ss'))} ${chalk.yellow('[WARN]')} ${msg}`),
    error: (msg) => console.log(`${chalk.gray(moment().format('HH:mm:ss'))} ${chalk.red('[ERROR]')} ${msg}`),
    cmd: (msg) => console.log(`${chalk.gray(moment().format('HH:mm:ss'))} ${chalk.magenta('[CMD]')} ${msg}`)
};

export default logger;
