/**
 * Account Login and Task Automation Script
 * Author: Tas33n
 * Repository: https://github.com/tas33n/REFER_HACK.git
 * Copyright (c) 2024 tas33n
 *
 * This script logs in to the link-monetize.com website with accounts from accounts.txt,
 * navigates to the tasks page, and clicks the "Take Task" buttons.
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const chalk = require('chalk');

const accountsFile = 'accounts.txt';
const loginURL = 'https://link-monetize.com/login';
const dashboardURL = 'https://link-monetize.com/dashboard';
const tasksURL = 'https://link-monetize.com/task';
const logoutURL = 'https://link-monetize.com/logout';

const sleep = ms => new Promise(res => setTimeout(res, ms));

const getLoginToken = async (page) => {
    await page.goto(loginURL, { waitUntil: 'networkidle2' });
    const token = await page.$eval('input[name="_token"]', el => el.value);
    return token;
};

const loginAccount = async (page, email, password) => {
    const token = await getLoginToken(page);

    await page.goto(loginURL, { waitUntil: 'networkidle2', timeout: 10000 });

    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);
    await page.$eval('input[name="_token"]', (el, value) => el.value = value, token);
    await page.click('button[type="submit"]');

    try {
        await page.waitForSelector('li.user-menu a[href="https://link-monetize.com/task"]', { timeout: 10000 });
        return page.url() == dashboardURL;
    } catch (error) {
        // console.log(error);
        return false;
    }
};

const completeTasks = async (page) => {
    await page.goto(tasksURL, { waitUntil: 'networkidle2' });

    let taskButtons = await page.$$('.custom-task-button');
    let taskCount = taskButtons.length;
    console.log(chalk.blue(`Found ${taskCount} tasks.`));

    while (taskButtons.length > 0) {
        for (const button of taskButtons) {
            try {
                const [newPage] = await Promise.all([
                    new Promise(resolve => page.once('popup', resolve)),
                    button.click()
                ]);

                await sleep(3000)
                console.log(chalk.green(`Task completed: ${await newPage.title()}`));

                await newPage.close();
                await page.goto(tasksURL, { waitUntil: 'networkidle2' });
            } catch (error) {
                console.log(chalk.red(`Error completing task: ${error.message}`));
            }
        }

        taskButtons = await page.$$('.custom-task-button');
    }

    if (taskCount > 0) {
        console.log(chalk.green('All tasks completed.'));
        return true
    } else {
        console.log(chalk.red('No tasks available.'));
        return true
    }
};

const logoutAccount = async (page) => {
    const token = await page.$eval('input[name="_token"]', el => el.value);
    await page.evaluate((token) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://link-monetize.com/logout';
        form.innerHTML = `<input type="hidden" name="_token" value="${token}" autocomplete="off">`;
        document.body.appendChild(form);
        form.submit();
    }, token);
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
};

const run = async () => {
    const accountsData = await fs.readFile(accountsFile, 'utf-8');
    const accounts = accountsData.split('\n').map(line => line.trim()).filter(Boolean);

    let successCount = 0;
    let failureCount = 0;

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (const [index, account] of accounts.entries()) {
        const [email, password] = account.split(':');

        console.log(chalk.blue(`(${index + 1}/${accounts.length}) Logging in with account: ${email}`));

        try {
            const isSuccess = await loginAccount(page, email, password);

            if (isSuccess) {
                successCount++;
                console.log(chalk.green(`Successfully logged in with ${email}`));
                const isTaskDone = await completeTasks(page);
                if (isTaskDone) {
                    console.log(chalk.green(`Completed tasks for ${email}`));
                    await logoutAccount(page);
                    console.log(chalk.green(`Logged out ${email}`));
                } else {
                    console.log("something is wrong")
                }

            } else {
                failureCount++;
                console.log(chalk.red(`Failed to log in with ${email}`));
            }
        } catch (error) {
            failureCount++;
            console.log(chalk.red(`Error logging in with ${email}:`, error));
            console.log(error);
        }

        await sleep(5000); // Wait 5 seconds between accounts
    }

    await browser.close();

    console.log(chalk.blue(`Total successful logins: ${successCount}`));
    console.log(chalk.blue(`Total failed logins: ${failureCount}`));
};

run().catch(console.error);
