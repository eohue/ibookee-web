
import { insertProjectSchema } from "../shared/schema";

console.log("Testing Project Creation Schema Validation...");

const testCases = [
    {
        name: "Valid Full Payload",
        payload: {
            title: "Test Project",
            titleEn: "Test Project En",
            location: "Seoul",
            category: "youth",
            description: "Description",
            imageUrl: "http://example.com/image.jpg",
            year: 2024,
            units: 100,
            featured: false,
            partnerLogos: ["logo1.png", "logo2.png"]
        },
        expected: true
    },
    {
        name: "Valid Minimal Payload (Optional fields undefined)",
        payload: {
            title: "Test Project",
            location: "Seoul",
            category: "youth",
            description: "Description",
            imageUrl: "http://example.com/image.jpg",
            year: 2024,
            // units undefined
            // titleEn undefined
            // featured undefined
            // partnerLogos undefined
        },
        expected: true
    },
    {
        name: "Payload with Empty Strings for Optionals (Frontend behavior)",
        payload: {
            title: "Test Project",
            titleEn: "", // Empty string
            location: "Seoul",
            category: "youth",
            description: "Description",
            imageUrl: "http://example.com/image.jpg",
            year: 2024,
            units: undefined, // Handled as undefined by logic
            featured: false,
            partnerLogos: []
        },
        expected: true
    },
    {
        name: "Payload with invalid types (string year)",
        payload: {
            title: "Test Project",
            location: "Seoul",
            category: "youth",
            description: "Description",
            imageUrl: "http://example.com/image.jpg",
            year: "2024", // String instead of number
            units: 100
        },
        expected: false
    },
    {
        name: "Payload with NaN year (simulating strict parse)",
        payload: {
            title: "Test Project",
            location: "Seoul",
            category: "youth",
            description: "Description",
            imageUrl: "http://example.com/image.jpg",
            year: NaN,
            units: 100
        },
        expected: false
    },
    {
        name: "Payload with 0 units (verify logic)",
        payload: {
            title: "Test Project",
            location: "Seoul",
            category: "youth",
            description: "Description",
            imageUrl: "http://example.com/image.jpg",
            year: 2024,
            units: 0
        },
        expected: true
    },
    {
        name: "Payload with nulls (New Frontend behavior)",
        payload: {
            title: "Test Project",
            titleEn: null, // Explicit null
            location: "Seoul",
            category: "youth",
            description: "Description",
            imageUrl: "http://example.com/image.jpg",
            year: 2025,
            units: 0,
            featured: false,
            partnerLogos: []
        },
        expected: true
    }
];

testCases.forEach((test, index) => {
    const result = insertProjectSchema.safeParse(test.payload);
    const success = result.success === test.expected;

    console.log(`\nTest Case ${index + 1}: ${test.name}`);
    console.log(`Success: ${result.success}`);
    if (!success) {
        console.error("❌ FAILED: Unexpected result");
        if (!result.success) {
            console.error("Zod Errors:", JSON.stringify(result.error.format(), null, 2));
        }
    } else {
        console.log("✅ PASSED");
    }
});
