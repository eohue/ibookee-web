import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as NaverStrategy } from "passport-naver";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { storage } from "../../storage";

// Helper to handle user creation/update
async function handleSocialLogin(
    req: any,
    provider: "google" | "naver" | "kakao",
    profile: any,
    done: any
) {
    try {
        const email = profile.emails?.[0]?.value;
        const photoUrl = profile.photos?.[0]?.value;
        const displayName = profile.displayName;

        let providerId = profile.id;

        // Find by provider ID
        let user;
        if (provider === "google") {
            user = await storage.getUserByGoogleId(providerId);
        } else if (provider === "naver") {
            user = await storage.getUserByNaverId(providerId);
        } else if (provider === "kakao") {
            user = await storage.getUserByKakaoId(providerId);
        }

        // If not found, try to find by email
        if (!user && email) {
            user = await storage.getUserByEmail(email);
        }

        // Prepare user data
        const userData: any = {
            email: email,
            firstName: displayName?.split(' ')[0] || "User",
            lastName: displayName?.split(' ').slice(1).join(' ') || "",
            profileImageUrl: photoUrl,
            role: "user",
            // Set the provider ID
            [`${provider}Id`]: providerId
        };

        // If user exists, we update (link account)
        if (user) {
            // Update the user with the new provider ID if not already set
            userData.id = user.id;
            // Preserve existing data if we don't want to overwrite
            // But upsertUser implementation currently overwrites fields if provided
            // We might want to be careful not to overwrite valid data with bad social data
        }

        // UpsertUser handles creation or update
        // Note: upsertUser requires email if creating new
        if (!user && !email) {
            // If we don't have an email from social login and no user exists, we can't create a reliable user record
            // Some providers might not return email.
            // For now, fail if no email? Or generate a fake one?
            // Let's assume email is required.
            return done(new Error("Email is required for sign up"), null);
        }

        const savedUser = await storage.upsertUser(userData);
        return done(null, savedUser);

    } catch (err) {
        return done(err as Error, null);
    }
}

export function setupSocialAuth() {
    // Google
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
            passReqToCallback: true
        }, (req, accessToken, refreshToken, profile, done) => {
            handleSocialLogin(req, "google", profile, done);
        }));
        console.log("Google Strategy registered");
    }

    // Naver
    if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
        passport.use(new NaverStrategy({
            clientID: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_CLIENT_SECRET,
            callbackURL: "/api/auth/naver/callback",
            passReqToCallback: true
        }, (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
            // Naver profile normalization might be needed depending on the library version
            handleSocialLogin(req, "naver", profile, done);
        }));
        console.log("Naver Strategy registered");
    }

    // Kakao
    if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
        // Usually KAKAO_CLIENT_ID is the REST API Key. Client Secret is optional but recommended.
        passport.use(new KakaoStrategy({
            clientID: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET || "", // Optional
            callbackURL: "/api/auth/kakao/callback",
            passReqToCallback: true
        }, (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
            // Kakao profile normalization
            // Profile usually has _json.kakao_account.email
            const normalizedProfile = {
                ...profile,
                photos: [{ value: profile._json?.properties?.profile_image }],
                emails: [{ value: profile._json?.kakao_account?.email }]
            };
            handleSocialLogin(req, "kakao", normalizedProfile, done);
        }));
        console.log("Kakao Strategy registered");
    }
}
