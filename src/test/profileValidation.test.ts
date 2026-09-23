import { describe, it, expect } from "vitest";

// Age validation logic (mirrors ProfileCreationPage)
function calculateAge(dob: string): number {
    if (!dob) return 0;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

// Profile completeness check (mirrors Continue button logic)
function isProfileComplete(data: {
    fullName: string;
    occupationVerified?: boolean;
    dob: string;
    gender: string;
    intent: string;
    photoCount: number;
}): boolean {
    const { fullName, dob, gender, intent, photoCount } = data;
    const age = calculateAge(dob);
    return (
        fullName.trim().length > 0 &&
        dob !== "" &&
        age >= 18 &&
        gender !== "" &&
        intent !== "" &&
        photoCount >= 2
    );
}

describe("Age Validation", () => {
    it("passes for 18-year-old", () => {
        const dob = new Date();
        dob.setFullYear(dob.getFullYear() - 18);
        expect(calculateAge(dob.toISOString().split("T")[0])).toBeGreaterThanOrEqual(18);
    });

    it("fails for 17-year-old", () => {
        const dob = new Date();
        dob.setFullYear(dob.getFullYear() - 17);
        expect(calculateAge(dob.toISOString().split("T")[0])).toBeLessThan(18);
    });

    it("passes for 30-year-old", () => {
        const dob = new Date();
        dob.setFullYear(dob.getFullYear() - 30);
        expect(calculateAge(dob.toISOString().split("T")[0])).toBe(30);
    });

    it("returns 0 for empty string", () => {
        expect(calculateAge("")).toBe(0);
    });
});

describe("Profile Completeness", () => {
    const validDob = (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 25);
        return d.toISOString().split("T")[0];
    })();

    const completeProfile = {
        fullName: "Amara Johnson",
        occupationVerified: true,
        dob: validDob,
        gender: "Woman",
        intent: "Long-term relationship",
        photoCount: 2,
    };

    it("returns true for fully complete profile", () => {
        expect(isProfileComplete(completeProfile)).toBe(true);
    });

    it("returns false when name is empty", () => {
        expect(isProfileComplete({ ...completeProfile, fullName: "" })).toBe(false);
    });

    it("returns true even when occupation is not provided", () => {
        expect(isProfileComplete({ ...completeProfile, occupationVerified: false })).toBe(true);
    });

    it("returns false when under 18", () => {
        const underage = new Date();
        underage.setFullYear(underage.getFullYear() - 16);
        expect(isProfileComplete({ ...completeProfile, dob: underage.toISOString().split("T")[0] })).toBe(false);
    });

    it("returns false when gender not selected", () => {
        expect(isProfileComplete({ ...completeProfile, gender: "" })).toBe(false);
    });

    it("returns false when intent not selected", () => {
        expect(isProfileComplete({ ...completeProfile, intent: "" })).toBe(false);
    });

    it("returns false with only 1 photo", () => {
        expect(isProfileComplete({ ...completeProfile, photoCount: 1 })).toBe(false);
    });

    it("returns true with exactly 2 photos (minimum)", () => {
        expect(isProfileComplete({ ...completeProfile, photoCount: 2 })).toBe(true);
    });

    it("returns true with 5 photos (maximum)", () => {
        expect(isProfileComplete({ ...completeProfile, photoCount: 5 })).toBe(true);
    });
});
