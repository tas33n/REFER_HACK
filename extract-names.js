const fs = require('fs').promises;

const usersDataFile = 'usersData.json';
const namesFile = 'names.txt';

const extractNames = async () => {
    try {
        const data = await fs.readFile(usersDataFile, 'utf-8');
        const users = JSON.parse(data);

        const names = users.map(user => user.name).join('\n');

        await fs.writeFile(namesFile, names, 'utf-8');
        console.log('Names have been successfully extracted and saved to names.txt');
    } catch (error) {
        console.error('Error reading or writing files:', error);
    }
};

extractNames();
