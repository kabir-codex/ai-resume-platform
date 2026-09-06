import { validateRequest, registerSchema, loginSchema, chatSchema, interviewSchema, stripeCheckoutSchema } from "../validation";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should validate valid registration data", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };
      const result = validateRequest(registerSchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        email: "john@example.com",
        password: "password123",
      };
      const result = validateRequest(registerSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Name is required");
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
      };
      const result = validateRequest(registerSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid email address");
      }
    });

    it("should reject short password", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "short",
      };
      const result = validateRequest(registerSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Password must be at least 8 characters");
      }
    });

    it("should reject too long name", () => {
      const invalidData = {
        name: "a".repeat(101),
        email: "john@example.com",
        password: "password123",
      };
      const result = validateRequest(registerSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Name too long");
      }
    });
  });

  describe("loginSchema", () => {
    it("should validate valid login data", () => {
      const validData = {
        email: "john@example.com",
        password: "password123",
      };
      const result = validateRequest(loginSchema, validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
      };
      const result = validateRequest(loginSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const invalidData = {
        email: "john@example.com",
        password: "",
      };
      const result = validateRequest(loginSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("chatSchema", () => {
    it("should validate valid chat message", () => {
      const validData = {
        message: "Hello, how can I improve my resume?",
        history: [
          { role: "user", content: "Hi" },
          { role: "assistant", content: "Hello!" },
        ],
      };
      const result = validateRequest(chatSchema, validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty message", () => {
      const invalidData = {
        message: "",
        history: [],
      };
      const result = validateRequest(chatSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Message is required");
      }
    });

    it("should reject too long message", () => {
      const invalidData = {
        message: "a".repeat(4001),
        history: [],
      };
      const result = validateRequest(chatSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Message too long");
      }
    });

    it("should reject too many history items", () => {
      const invalidData = {
        message: "Hello",
        history: Array(21).fill({ role: "user", content: "Hi" }),
      };
      const result = validateRequest(chatSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept optional history", () => {
      const validData = {
        message: "Hello",
      };
      const result = validateRequest(chatSchema, validData);
      expect(result.success).toBe(true);
    });
  });

  describe("interviewSchema", () => {
    it("should validate valid interview request", () => {
      const validData = {
        role: "Senior Backend Engineer",
        resumeId: "clx1234567890abcdef",
      };
      const result = validateRequest(interviewSchema, validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty role", () => {
      const invalidData = {
        role: "",
        resumeId: "clx1234567890abcdef",
      };
      const result = validateRequest(interviewSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Role is required");
      }
    });

    it("should reject invalid resumeId", () => {
      const invalidData = {
        role: "Engineer",
        resumeId: "invalid-id",
      };
      const result = validateRequest(interviewSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept optional resumeId", () => {
      const validData = {
        role: "Engineer",
      };
      const result = validateRequest(interviewSchema, validData);
      expect(result.success).toBe(true);
    });
  });

  describe("stripeCheckoutSchema", () => {
    it("should validate valid checkout request", () => {
      const validData = {
        priceId: "price_12345",
      };
      const result = validateRequest(stripeCheckoutSchema, validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty object", () => {
      const validData = {};
      const result = validateRequest(stripeCheckoutSchema, validData);
      expect(result.success).toBe(true);
    });
  });
});