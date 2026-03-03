import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes:",
      items: ["Personal information (name, email address, phone number)", "Business information (shop name, business details)", "Order and transaction data", "Customer information you input into the system"],
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to:",
      items: ["Provide, maintain, and improve our services", "Process transactions and send related information", "Send you technical notices, updates, and support messages", "Respond to your comments, questions, and requests", "Monitor and analyze trends, usage, and activities"],
    },
    {
      title: "3. Data Security",
      content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted and stored securely on our servers.",
    },
    {
      title: "4. Data Sharing",
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or to protect our rights.",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: January 2026</p>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold text-card-foreground mb-3">{section.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
              {section.items && (
                <ul className="mt-3 space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
