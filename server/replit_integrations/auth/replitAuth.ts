import * as client from "openid-client";

import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "../../storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const isReplit = !!process.env.REPL_ID;

const getOidcConfig = memoize(
  async () => {
    if (!isReplit) throw new Error("Not active Replit environment");
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, hash: string) {
  const [salt, key] = hash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(keyBuffer, derivedKey);
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  let sessionStore;

  if (process.env.DATABASE_URL) {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true, // Ensure session table exists
      ttl: sessionTtl,
      tableName: "sessions",
    });
  } else {
    console.warn("Using MemoryStore for sessions (no DATABASE_URL)");
    sessionStore = new session.MemoryStore();
  }

  return session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Changed to false for debugging login issues
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

import { setupSocialAuth } from "./social";

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup Social Auth Strategies
  setupSocialAuth();

  passport.serializeUser((user: any, cb) => cb(null, user.id)); // Serialize by ID
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      cb(null, user);
    } catch (e) {
      cb(e);
    }
  });

  if (isReplit) {
    // Replit Auth Strategy
    const config = await getOidcConfig();
    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, tokens.claims()); // Pass claims or user object
    };
    // ... rest of Replit logic (omitted for brevity, assume similar)
    // For now prioritizing local flow requested by user.
  }

  // Local Dev Strategy (Email/Password) - Enabled Globally
  {
    console.log("Setting up Local Auth Strategy");

    passport.use(new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`[LocalStrategy] Attempting login for: ${username}`);
        const user = await storage.getUserByEmail(username);
        if (!user || !user.password) {
          console.log(`[LocalStrategy] User not found or no password: ${username}`);
          return done(null, false, { message: "Incorrect email or password." });
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          console.log(`[LocalStrategy] Invalid password for: ${username}`);
          return done(null, false, { message: "Incorrect email or password." });
        }

        console.log(`[LocalStrategy] Login successful for: ${username}`);
        return done(null, user);
      } catch (err) {
        console.error(`[LocalStrategy] Error:`, err);
        return done(err);
      }
    }));

    app.post("/api/login", (req, res, next) => {
      console.log(`[API] Login request received`);
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          console.error(`[API] Login error:`, err);
          return next(err);
        }
        if (!user) {
          console.log(`[API] Login failed (no user):`, info);
          return res.status(401).json({ message: "Invalid credentials" });
        }
        req.logIn(user, (err) => {
          if (err) {
            console.error(`[API] req.logIn error:`, err);
            return next(err);
          }
          console.log(`[API] Session established for user: ${user.id}`);
          return res.json(user);
        });
      })(req, res, next);
    });

    app.post("/api/register", async (req, res) => {
      try {
        const { username, password, realName, nickname } = req.body;
        if (!username || !password) {
          return res.status(400).send("이메일과 비밀번호를 입력해주세요.");
        }
        if (!realName || !nickname) {
          return res.status(400).send("이름(실명)과 닉네임을 입력해주세요.");
        }
        const existingUser = await storage.getUserByEmail(username);

        if (existingUser) {
          return res.status(400).send("이미 가입된 이메일입니다.");
        }

        const hashedPassword = await hashPassword(password);
        const user = await storage.upsertUser({
          email: username,
          password: hashedPassword,
          createdAt: new Date(),
          realName: realName,
          nickname: nickname,
          firstName: realName, // Use realName as firstName for display
          lastName: "",
          role: "user",
        });

        req.logIn(user, (err) => {
          if (err) throw err;
          res.status(201).json(user);
        });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send("Error registering user");
      }
    });

    app.post("/api/logout", (req, res) => {
      req.logout(() => {
        res.sendStatus(200);
      });
    });

    // Seed Admin Account logic removed to prevent DB connection exhaustion on serverless startup.
    // Admin account should be created via registration or dedicated script.
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = req.user as any;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};
