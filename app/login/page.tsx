import { LoginForm } from "@/components/login-form";
import { SectionHeading } from "@/components/section-heading";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Account" title="Login or register to manage bookings." copy="The MVP uses local mock auth so you can test the customer and admin flows immediately." />
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
