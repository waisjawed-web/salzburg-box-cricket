import { LoginForm } from "@/components/login-form";
import { SectionHeading } from "@/components/section-heading";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Account" title="Login or register to manage bookings." copy="Create a customer account to manage bookings once the live database is connected." />
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
