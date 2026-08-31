import { CalendarCheck, CreditCard, Ticket, UserRound } from "lucide-react";

import { useAuthStore } from "#/features/auth/store/authStore";

import { upcomingBookings, recentPayments } from "../utils/dashboardData";

const stats = [
  { icon: Ticket, label: "Upcoming Tickets", value: "4" },
  { icon: CalendarCheck, label: "Active Bookings", value: "2" },
  { icon: CreditCard, label: "Paid This Month", value: "NPR 2,100" },
];

function DashboardPage() {
  const customer = useAuthStore((state) => state.customer);

  return (
    <div className="space-y-8">
      <section className="bg-surface overflow-hidden rounded-md border shadow-sm">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-primary text-sm font-medium">Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Welcome Back, {customer?.fullName ?? "Movie Lover"}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
              Keep track of upcoming shows, payments, and booking preferences from one place.
            </p>
          </div>

          <div className="bg-primary/10 text-primary flex size-20 items-center justify-center rounded-md">
            <UserRound className="size-9" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="bg-surface rounded-md border p-5 shadow-sm" key={stat.label}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                </div>
                <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-md">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="bg-surface rounded-md border p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Upcoming Bookings</h3>
          <div className="mt-4 grid gap-3">
            {upcomingBookings.map((booking) => (
              <div className="bg-background rounded-md border p-4" key={booking.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{booking.movie}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {booking.venue} • {booking.screen}
                    </p>
                  </div>
                  <span className="bg-success/10 text-success rounded-md px-2 py-1 text-xs font-medium">
                    {booking.status}
                  </span>
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  {booking.date} • {booking.time} • Seats {booking.seats}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-md border p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Recent Payments</h3>
          <div className="mt-4 grid gap-3">
            {recentPayments.map((payment) => (
              <div className="bg-background rounded-md border p-4" key={payment.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{payment.movie}</p>
                    <p className="text-muted-foreground mt-1 text-sm">{payment.method}</p>
                  </div>
                  <p className="font-semibold">{payment.amount}</p>
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  {payment.date} • {payment.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export { DashboardPage };
