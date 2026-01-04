
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
}

async function updateAdminPassword() {
    const dbPath = path.resolve(process.cwd(), "db.json");
    if (!fs.existsSync(dbPath)) {
        console.error("db.json not found");
        return;
    }

    const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    const adminEmail = "lks@ibookee.kr";
    const newPassword = "admin123!@#";

    // Find admin user in the nested array structure [id, userObject]
    const adminEntry = db.users.find((entry: any) => entry[1].email === adminEmail);

    if (adminEntry) {
        console.log("Found admin user. Updating password...");
        const hashedPassword = await hashPassword(newPassword);
        adminEntry[1].password = hashedPassword;

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        console.log("Password updated successfully.");
    } else {
        console.log("Admin user not found.");
    }
}

updateAdminPassword();
