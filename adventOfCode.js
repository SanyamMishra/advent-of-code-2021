const path = require('path');
const fs = require('fs/promises');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
const inquirer = require('inquirer');

global.dayChosen = null;

function getDayChoices() {
    return fs.readdir(path.join(__dirname, 'src'));
}

function getDayFromCli(dayChoices) {
    const days = dayChoices.map(day => +day.match(/^Day (\d+) - /)[1]);

    if (!argv.day) {
        return null;
    }

    if (!days.includes(argv.day)) {
        return null;
    }

    return dayChoices[days.indexOf(argv.day)];
}

async function dayPrompt(choices) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'day',
            message: 'Select a day:',
            choices,
        },
    ]).then(answer => answer.day);
}

function getPartFromCli(partChoices) {
    if (!argv.part) {
        return null;
    }

    const part = (String(argv.part)).toLowerCase()

    if (!partChoices.map(part => part.toLowerCase()).includes(part)) {
        return null;
    }

    return part;
}

async function partPrompt(choices) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'part',
            message: 'Select the Quiz Part:',
            choices,
            default: choices.length - 1
        },
    ]).then(answer => answer.part.toLowerCase());
}

function getInputTypeFromCli(inputTypeChoices) {
    if (!argv.inputType) {
        return null;
    }

    const inputType = (String(argv.inputType)).toLowerCase()

    if (!inputTypeChoices.map(inputType => inputType.toLowerCase()).includes(inputType)) {
        return null;
    }

    return inputType;
}

async function inputTypePrompt(choices) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'inputType',
            message: 'Select the input type:',
            choices,
            default: choices.length - 1
        },
    ]).then(answer => answer.inputType.toLowerCase());
}

async function init() {
    const dayChoices = await getDayChoices();
    const partChoices = ['One', 'Two', 'Both'];
    const inputTypeChoices = ['Sample', 'Main', 'Both'];

    dayChosen = getDayFromCli(dayChoices);
    if (!dayChosen) {
        dayChosen = await dayPrompt(dayChoices);
    }

    let partChosen = getPartFromCli(partChoices);
    if (!partChosen) {
        partChosen = await partPrompt(partChoices);
    }

    let inputTypeChosen = getInputTypeFromCli(inputTypeChoices);
    if (!inputTypeChosen) {
        inputTypeChosen = await inputTypePrompt(inputTypeChoices);
    }

    console.log();

    const quiz = require(`./src/${dayChosen}/index`);

    if (partChosen === 'one' || partChosen === 'both') {
        console.log('Part 1:');
        if (inputTypeChosen === 'sample' || inputTypeChosen === 'both') {
            console.log(`sample answer: ${await quiz.partOne('sample')}`);
        }
        if (inputTypeChosen === 'main' || inputTypeChosen === 'both') {
            console.log(`main answer: ${await quiz.partOne('main')}`);
        }
    }

    if (partChosen === 'both') console.log();

    if (partChosen === 'two' || partChosen === 'both') {
        console.log('Part 2:');
        if (inputTypeChosen === 'sample' || inputTypeChosen === 'both') {
            console.log(`sample answer: ${await quiz.partTwo('sample')}`);
        }
        if (inputTypeChosen === 'main' || inputTypeChosen === 'both') {
            console.log(`main answer: ${await quiz.partTwo('main')}`);
        }
    }
}

init();