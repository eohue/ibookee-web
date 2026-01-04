
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db.json');
console.log(`Reading db from: ${dbPath}`);

if (fs.existsSync(dbPath)) {
    try {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        console.log("DB Loaded.");

        // MemStorage stores users as an array of entries [id, userObject]
        // because it uses Map.entries() for persistence.
        // "users": Array.from(this.users.entries()),

        if (data.users) {
            console.log(`Found ${data.users.length} users.`);
            const adminUserEntry = data.users.find(entry => {
                const user = entry[1];
                return user.email === 'lks@ibookee.kr';
            });

            if (adminUserEntry) {
                console.log("Admin User Found:");
                console.log(JSON.stringify(adminUserEntry[1], null, 2));
            } else {
                console.log("Admin User 'lks@ibookee.kr' NOT found in users list.");
                // Print a few users to see what's there
                console.log("First 3 users:", JSON.stringify(data.users.slice(0, 3).map(e => e[1]), null, 2));
            }
        } else {
            console.log("No 'users' key in db.json");
        }

    } catch (err) {
        console.error("Error reading/parsing db.json:", err);
    }
} else {
    console.log("db.json not found!");
}
