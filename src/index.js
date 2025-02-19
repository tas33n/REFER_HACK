/**
 * Reffer Hack
 * Author: Tas33n
 * Repository: https://github.com/tas33n/REFER_HACK.git
 * Copyright (c) 2024 tas33n
 *
 * This script automates account registration by extracting a CSRF token and cookies
 * from the registration page, then submitting a registration form using random user data.
 * Successful registrations are logged and stored in a file.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const chalk = require('chalk');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask for referral ID
rl.question('Please enter your referral ID: ', (refferral_id) => {
    console.log(`Referral ID entered: ${refferral_id}`); // Debug log

    // Ask for limit
    rl.question('Please enter the limit (default is 100): ', (limitInput) => {
        const limit = limitInput ? parseInt(limitInput, 10) : 100;
        // console.log(`Limit entered: ${limit}`); // Debug log

        // Main task starts here, dont edit below this line
        const namesFile = 'names.txt';
        const accountsFile = 'accounts.txt';
        const baseURL = 'https://link-monetize.com';
        const registerURL = `${baseURL}/register?ref=${refferral_id}`;
        let userAgents = [];
        (async () => {
            // console.log('Reading user agents file...'); // Debug log
            userAgents = (await fs.readFile('user-agents.txt', 'utf-8')).split('\n').map(ua => ua.trim()).filter(Boolean);
            // console.log('User agents loaded.'); // Debug log
        })();

        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const getTokenAndCookies = async () => {
            // console.log('Fetching token and cookies...'); // Debug log
            const response = await axios.get(registerURL);
            const $ = cheerio.load(response.data);
            const token = $('input[name="_token"]').val();
            const cookies = response.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
            // console.log('Token and cookies fetched.'); // Debug log
            return { token, cookies };
        };

        const registerAccount = async (firstName, lastName, email, password) => {
            // console.log(`Registering account for ${email}...`); // Debug log
            const { token, cookies } = await getTokenAndCookies();
            const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

            const response = await axios.post(`${baseURL}/register`, new URLSearchParams({
                _token: token,
                referral_id: refferral_id,
                first_name: firstName,
                last_name: lastName,
                phone: `018${Math.floor(Math.random() * 1000000000).toString().padStart(7, '0')}`,
                email: email,
                password: password,
                password_confirmation: password,
            }).toString(), {
                headers: {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'accept-language': 'en-GB,en;q=0.9',
                    'cache-control': 'max-age=0',
                    'content-type': 'application/x-www-form-urlencoded',
                    'cookie': cookies,
                    'dnt': '1',
                    'origin': baseURL,
                    'priority': 'u=0, i',
                    'referer': registerURL,
                    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                    'user-agent': userAgent,
                }
            });

            if (response.status === 200) {
                // console.log(`Account registered: ${email}`); // Debug log
                await fs.appendFile(accountsFile, `${email}:${password}\n`);
                return true;
            } else {
                // console.log(`Failed to register account: ${email}`); // Debug log
                return false;
            }
        };

        const generateStrongPassword = () => {
            const length = 12;
            const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
            let password = "";
            for (let i = 0, n = charset.length; i < length; ++i) {
                password += charset.charAt(Math.floor(Math.random() * n));
            }
            return password;
        };

        const run = async () => {
            // console.log('Reading names file...'); // Debug log
            const names = await fs.readFile(namesFile, 'utf-8');
            const nameList = names.split('\n').map(name => name.trim()).filter(Boolean);
            // console.log('Names loaded.'); // Debug log

            let successCount = 0;
            let failureCount = 0;

            for (let i = 0; i < limit; i++) {
                const randomIndex = Math.floor(Math.random() * nameList.length);
                const fullName = nameList[randomIndex];
                const [firstName, ...lastNameParts] = fullName.split(' ');
                const lastName = lastNameParts.join(' ');
                const email = `${firstName.toLowerCase().replace(/\s+/g, '')}${lastName.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 1000)}@gmail.com`;
                const password = generateStrongPassword();

                try {
                    const isSuccess = await registerAccount(firstName, lastName, email, password);
                    if (isSuccess) {
                        successCount++;
                        console.log(chalk.green(`(${i + 1}/${nameList.length}) Success => ${email} : ${password}`));
                    } else {
                        failureCount++;
                        console.log(chalk.red(`(${i + 1}/${nameList.length}) Failed => ${email} : ${password}`));
                    }
                } catch (error) {
                    failureCount++;
                    console.log(chalk.red(`(${i + 1}/${nameList.length}) Error ${email} : ${password} `, error));
                }

                // wait for next account creation
                await wait(Math.floor(Math.random() * 10000) + 5000);
            }

            console.log(chalk.blue(`Total successful registrations: ${successCount}`));
            console.log(chalk.blue(`Total failed registrations: ${failureCount}`));
        };

        run().catch(console.error).finally(() => rl.close());
    });
});