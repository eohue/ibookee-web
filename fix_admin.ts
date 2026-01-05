
import * as fs from 'fs';
import * as path from 'path';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
}

// Define User interface matching your model
interface User {
    id: string;
    email: string;
    password?: string | null;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
    createdAt: string | Date;
    updatedAt?: string | Date;
}

const dbPath = path.resolve(process.cwd(), "db.json");
console.log(`Targeting Database File: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
    console.log("bs.json does not exist. Creating new one...");
    fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2));
}

try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(rawData);

    // Convert array of entries back to map/array logic
    // MemStorage persists as: "users": [[id, userObj], [id, userObj]]
    let usersMap = new Map<string, User>(data.users as any);

    console.log(`Loaded ${usersMap.size} users.`);

    const adminEmail = "lks@ibookee.kr";
    let adminUser: User | undefined;
    let adminId: string | undefined;

    // Find existing admin
    for (const [id, user] of usersMap.entries()) {
        if (user.email === adminEmail) {
            adminUser = user;
            adminId = id;
            break;
        }
    }

    // Generate Admin
    if (adminUser) {
        console.log("Admin user found. Updating role...");
        adminUser.role = "admin";
        // Ensure other fields
        if (!adminUser.password) adminUser.password = await hashPassword("1234567890"); // Hashed password
        usersMap.set(adminId!, adminUser);
    } else {
        console.log("Admin user NOT found. Creating...");
        const newId = String(usersMap.size + 100); // Simple ID generation
        const newUser: User = {
            id: newId,
            email: adminEmail,
            password: await hashPassword("1234567890"), // Hashed password
            role: "admin",
            firstName: "Admin",
            lastName: "Account",
            createdAt: new Date(),
            updatedAt: new Date()
        };
        usersMap.set(newId, newUser);
    }

    // --- General User Setup ---
    const generalEmail = "test@ibookee.kr";
    let generalUser: User | undefined;
    let generalId: string | undefined;

    // Find existing general user
    for (const [id, user] of usersMap.entries()) {
        if (user.email === generalEmail) {
            generalUser = user;
            generalId = id;
            break;
        }
    }

    if (generalUser) {
        console.log("General test user found. Resetting password/role...");
        generalUser.role = "user";
        generalUser.password = await hashPassword("1234567890");
        usersMap.set(generalId!, generalUser);
    } else {
        console.log("General test user NOT found. Creating...");
        const newId = String(usersMap.size + 101); // distinct ID
        const newUser: User = {
            id: newId,
            email: generalEmail,
            password: await hashPassword("1234567890"),
            role: "user",
            firstName: "General",
            lastName: "Member",
            createdAt: new Date(),
            updatedAt: new Date()
        };
        usersMap.set(newId, newUser);
    }

    // Save back
    data.users = Array.from(usersMap.entries());
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log("SUCCESS: Admin user 'lks@ibookee.kr' role set to 'admin'.");
    console.log("SUCCESS: General user 'test@ibookee.kr' created/updated.");
    console.log("Please RESTART the server to load these changes.");

} catch (error) {
    console.error("Failed to fix db.json:", error);
}
