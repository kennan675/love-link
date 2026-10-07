import React from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ChevronRight } from "lucide-react";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By creating an account or using BlackLoveLink ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform. We may update these Terms from time to time, and your continued use of the Platform after any changes constitutes acceptance of the revised Terms.`,
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: `You must be at least 21 years of age to create an account and use BlackLoveLink. By using the Platform, you represent and warrant that you are at least 21 years old, have the legal capacity to enter into a binding agreement, are not prohibited from using the Platform under any applicable law, and have not been previously removed or banned from the Platform.`,
  },
  {
    id: "account",
    title: "3. Your Account",
    content: `You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You agree to provide accurate, current, and complete information during registration and to update such information as needed. You may not create more than one account, share your account with others, or transfer your account to another person. We reserve the right to suspend or terminate accounts that violate these Terms.`,
  },
  {
    id: "conduct",
    title: "4. User Conduct",
    content: `BlackLoveLink is a community built on respect and authenticity. You agree not to: harass, bully, or intimidate other users; post false, misleading, or deceptive content; impersonate another person or entity; use the Platform for commercial purposes without authorization; upload content that is illegal, obscene, or infringes on any third-party rights; engage in any form of discrimination or hate speech; solicit money or financial information from other users; use automated systems, bots, or scripts to access the Platform; or attempt to gain unauthorized access to any part of the Platform.`,
  },
  {
    id: "content",
    title: "5. User Content",
    content: `You retain ownership of the content you post on BlackLoveLink, including photos, text, and other materials ("User Content"). By posting User Content, you grant BlackLoveLink a non-exclusive, worldwide, royalty-free, sublicensable license to use, display, reproduce, and distribute your User Content solely in connection with operating and improving the Platform. You represent that you own or have the necessary rights to the content you post and that your content does not violate any third-party rights. We reserve the right to remove any content that violates these Terms or our Community Guidelines.`,
  },
  {
    id: "matching",
    title: "6. Matching & Interactions",
    content: `BlackLoveLink uses algorithmic and curated matching based on preferences, interests, and behavioral data. We do not guarantee any specific outcome, including matches, dates, or relationships. All interactions between users are conducted at their own risk. BlackLoveLink is not responsible for the behavior of its members and does not conduct criminal background checks on users.`,
  },
  {
    id: "safety",
    title: "7. Safety & Reporting",
    content: `We are committed to maintaining a safe environment. If you encounter suspicious or inappropriate behavior, please report it immediately through the in-app reporting feature or by contacting safety@blacklovelink.com. We investigate all reports and may take action including warnings, temporary suspensions, or permanent bans. However, we cannot guarantee the identity or intentions of any user.`,
  },
  {
    id: "privacy",
    title: "8. Privacy",
    content: `Your privacy is extremely important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection and use of your information as described in the Privacy Policy.`,
  },
  {
    id: "ip",
    title: "9. Intellectual Property",
    content: `The BlackLoveLink name, logo, and all related marks, designs, and slogans are trademarks of BlackLoveLink. The Platform, including its design, features, and content (excluding User Content), is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works from any part of the Platform without our prior written consent.`,
  },
  {
    id: "termination",
    title: "10. Termination",
    content: `You may delete your account at any time through the Settings page. We may suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms. Upon termination, your right to use the Platform ceases immediately. Certain provisions of these Terms, including those relating to intellectual property, limitation of liability, and dispute resolution, survive termination.`,
  },
  {
    id: "disclaimers",
    title: "11. Disclaimers",
    content: `THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. BLACKLOVELINK DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. YOUR USE OF THE PLATFORM IS AT YOUR OWN RISK.`,
  },
  {
    id: "liability",
    title: "12. Limitation of Liability",
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLACKLOVELINK AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF YOUR USE OF OR INABILITY TO USE THE PLATFORM. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO BLACKLOVELINK IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.`,
  },
  {
    id: "governing-law",
    title: "13. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya. Any dispute arising from these Terms or the Platform shall be resolved through binding arbitration in Nairobi, Kenya, in accordance with the rules of the Nairobi Centre for International Arbitration.`,
  },
  {
    id: "contact",
    title: "14. Contact Us",
    content: `If you have any questions about these Terms of Service, please contact us at legal@blacklovelink.com or through our Contact page.`,
  },
];

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen font-display bg-background text-foreground">
      <SEO title={"Terms of Service | BlackLoveLink"} description={"The terms and conditions that govern your use of BlackLoveLink."} path="/terms-of-service" ogType="website" />
      <SharedNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">Legal</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6">
              Terms of <span className="text-gradient-brand">Service</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully before using BlackLoveLink.
            </p>
            <p className="text-sm text-muted-foreground/70 mt-4">
              Effective Date: April 28, 2026 · Last Updated: April 28, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-card border border-border"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 group"
                >
                  <ChevronRight className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
                  {section.title}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              className="p-8 rounded-3xl bg-card border border-border scroll-mt-24"
            >
              <h2 className="text-2xl font-black text-foreground mb-4">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default TermsOfServicePage;
