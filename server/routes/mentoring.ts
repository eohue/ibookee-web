import type { Express } from "express";
import { storage } from "../storage";
import { insertMentorSchema, insertMentoringConsultationSchema } from "@shared/schema";
import { isAdmin } from "../replit_integrations/auth";

export function registerMentoringRoutes(app: Express) {
  // 1. Mentors - List
  app.get("/api/mentors", async (req, res) => {
    try {
      const user = req.user as any;
      const statusParam = req.query.status as string | undefined;
      const status = user?.role === "admin" && statusParam ? statusParam : "active";
      const mentors = await storage.getMentors(status);
      res.json(mentors);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      res.status(500).json({ error: "Failed to fetch mentors" });
    }
  });

  // 2. Mentors - Detail
  app.get("/api/mentors/:id", async (req, res) => {
    try {
      const mentor = await storage.getMentor(req.params.id);
      if (!mentor) {
        return res.status(404).json({ error: "Mentor not found" });
      }
      res.json(mentor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mentor" });
    }
  });

  // 3. Mentors - Create (Admin)
  app.post("/api/mentors", isAdmin, async (req, res) => {
    try {
      const parsed = insertMentorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid mentor data", details: parsed.error });
      }
      const created = await storage.createMentor(parsed.data);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: "Failed to create mentor" });
    }
  });

  // 4. Mentors - Update (Admin)
  app.patch("/api/mentors/:id", isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateMentor(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Mentor not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update mentor" });
    }
  });

  // 5. Mentors - Delete (Admin)
  app.delete("/api/mentors/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteMentor(req.params.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete mentor" });
    }
  });

  // 6. Consultations - List (With privacy masking)
  app.get("/api/mentoring-consultations", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const mentorId = req.query.mentorId as string | undefined;
      const currentUser = req.user as any;
      const isAdminUser = currentUser?.role === "admin";
      const currentUserId = currentUser?.id;

      const consultations = await storage.getMentoringConsultations({ category, mentorId });

      // Apply masking for secret posts
      const sanitized = consultations.map((item) => {
        const isAuthor = currentUserId && item.userId === currentUserId;
        const canViewFull = isAdminUser || isAuthor;

        if (item.isSecret && !canViewFull) {
          return {
            ...item,
            title: "🔒 [비공개] 작성자와 멘토만 열람 가능한 상담입니다.",
            content: "비밀글로 보호된 상담 내용입니다.",
            answer: null,
            authorContact: null,
            preferredSchedule: null,
          };
        }

        // Hide contact from general users if not admin/author
        if (!canViewFull) {
          return {
            ...item,
            authorContact: null,
          };
        }

        return item;
      });

      res.json(sanitized);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      res.status(500).json({ error: "Failed to fetch consultations" });
    }
  });

  // 7. Consultations - Detail
  app.get("/api/mentoring-consultations/:id", async (req, res) => {
    try {
      const currentUser = req.user as any;
      const isAdminUser = currentUser?.role === "admin";
      const currentUserId = currentUser?.id;

      const consultation = await storage.getMentoringConsultation(req.params.id);
      if (!consultation) {
        return res.status(404).json({ error: "Consultation not found" });
      }

      const isAuthor = currentUserId && consultation.userId === currentUserId;
      const canView = !consultation.isSecret || isAdminUser || isAuthor;

      if (!canView) {
        return res.status(403).json({
          error: "비공개 상담 글입니다. 작성자와 관리자만 열람할 수 있습니다.",
          isSecret: true,
        });
      }

      // Increment views asynchronously
      storage.incrementMentoringConsultationViews(consultation.id).catch(() => {});

      // Hide contact if not admin or author
      if (!isAdminUser && !isAuthor) {
        consultation.authorContact = null;
      }

      res.json(consultation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consultation" });
    }
  });

  // 8. Consultations - Create
  app.post("/api/mentoring-consultations", async (req, res) => {
    try {
      const currentUser = req.user as any;
      const data = {
        ...req.body,
        userId: currentUser?.id || req.body.userId || null,
        authorNickname: req.body.authorNickname || currentUser?.nickname || currentUser?.realName || "익명 이웃",
      };

      const parsed = insertMentoringConsultationSchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid consultation data", details: parsed.error });
      }

      const created = await storage.createMentoringConsultation(parsed.data);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error creating consultation:", error);
      res.status(500).json({ error: "Failed to create consultation" });
    }
  });

  // 9. Consultations - Answer (Admin or Assigned Mentor)
  app.post("/api/mentoring-consultations/:id/answer", isAdmin, async (req, res) => {
    try {
      const { answer, answeredBy } = req.body;
      if (!answer || typeof answer !== "string") {
        return res.status(400).json({ error: "Answer content is required" });
      }

      const updated = await storage.answerMentoringConsultation(
        req.params.id,
        answer,
        answeredBy
      );

      if (!updated) {
        return res.status(404).json({ error: "Consultation not found" });
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to answer consultation" });
    }
  });

  // 10. Consultations - Update Status / Meeting Status (Admin)
  app.patch("/api/mentoring-consultations/:id", isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateMentoringConsultation(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Consultation not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update consultation" });
    }
  });

  // 11. Consultations - Delete (Admin)
  app.delete("/api/mentoring-consultations/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteMentoringConsultation(req.params.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete consultation" });
    }
  });
}
