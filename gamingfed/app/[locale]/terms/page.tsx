import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "termsPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

const LAST_UPDATED = "April 20, 2026";

export default async function TermsPage() {
  const t = await getTranslations("termsPage");

  return (
    <LegalLayout
      title={t("title")}
      subtitle={t("subtitle")}
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection heading="1. Acceptance of Terms">
        <p>
          By accessing or using the Kerala Hub platform ("Service"), you agree
          to be bound by these Terms and Conditions and our Privacy Policy. If
          you do not agree with any part of these terms, you may not use the
          Service.
        </p>
      </LegalSection>

      <LegalSection heading="2. Eligibility">
        <p>
          You must be at least 18 years old, or the age of majority in your
          jurisdiction, to create an account. You are responsible for providing
          accurate information during registration and keeping your credentials
          confidential.
        </p>
      </LegalSection>

      <LegalSection heading="3. Marketplace Transactions">
        <p>
          Kerala Hub provides a platform for buying and selling gaming accounts,
          in-game items, currency, and boosting services. All listings must
          comply with the terms of service of the corresponding game publishers.
          We do not own, endorse, or guarantee any listing, and are not a party
          to the transaction between buyer and seller.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sellers represent that they have full rights to the listed item.</li>
          <li>Buyers agree to pay the listed amount in the stated currency.</li>
          <li>Any chargebacks or fraudulent activity may result in account suspension.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Fees & Payments">
        <p>
          Kerala Hub may charge transaction, processing, or service fees that
          will be clearly disclosed before you confirm a purchase or listing.
          Fees are non-refundable except as required by law.
        </p>
      </LegalSection>

      <LegalSection heading="5. Prohibited Conduct">
        <ul className="list-disc pl-5 space-y-1">
          <li>Using the Service to engage in fraud or illegal activity.</li>
          <li>Impersonating another person or misrepresenting ownership.</li>
          <li>Attempting to access the platform through automated means.</li>
          <li>Posting content that is abusive, discriminatory, or obscene.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="6. Termination">
        <p>
          We may suspend or terminate your account at any time if you violate
          these Terms, engage in suspicious activity, or at the request of law
          enforcement. You may also delete your account at any time from your
          settings.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Kerala Hub is not liable for
          any indirect, incidental, or consequential damages arising from your
          use of the Service. Our total liability shall not exceed the amount
          you paid to us in the six months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to the Terms">
        <p>
          We may update these Terms from time to time. Material changes will be
          communicated through the Service. Continued use of Kerala Hub after
          updates constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Contact">
        <p>
          Questions? Reach us at{" "}
          <a
            href="mailto:support@keralahub.gg"
            className="text-cyan-400 hover:underline"
          >
            support@keralahub.gg
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
