import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using Bill Hisab BD, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our service.",
    },
    {
      title: "2. Description of Service",
      content: "Bill Hisab BD provides a billing and stock management platform for businesses. Our services include:",
      items: ["Order and bill creation", "Inventory management", "Customer relationship management", "Business analytics and reporting", "Courier integration services"],
    },
    {
      title: "3. User Accounts",
      content: "You are responsible for:",
      items: ["Maintaining the confidentiality of your account credentials", "All activities that occur under your account", "Notifying us immediately of any unauthorized use", "Providing accurate and complete information during registration"],
    },
    {
      title: "4. Acceptable Use",
      content: "You agree not to:",
      items: ["Use the service for any illegal purposes", "Attempt to gain unauthorized access to our systems", "Interfere with or disrupt the service", "Upload malicious code or content"],
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
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
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

export default TermsOfService;
