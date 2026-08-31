import { CreditCard, Download } from "lucide-react";

import { Button } from "#/shared/components/ui";
import { recentPayments } from "#/features/customer-dashboard/utils/dashboardData";

function MyPaymentsPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-primary text-sm font-medium">My Payments</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal">Payment History</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
          See successful ticket payments and keep receipts handy for your movie plans.
        </p>
      </section>

      <section className="bg-surface overflow-hidden rounded-md border shadow-sm">
        <div className="bg-surface-muted text-muted-foreground hidden grid-cols-[1fr_1fr_1fr_auto] gap-4 border-b px-5 py-3 text-sm font-medium md:grid">
          <span>Movie</span>
          <span>Payment Method</span>
          <span>Amount</span>
          <span>Receipt</span>
        </div>

        <div className="divide-y">
          {recentPayments.map((payment) => (
            <article
              className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
              key={payment.id}
            >
              <div>
                <p className="font-semibold">{payment.movie}</p>
                <p className="text-muted-foreground mt-1 text-sm">{payment.date}</p>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <CreditCard className="text-primary size-4" aria-hidden="true" />
                {payment.method}
              </p>
              <p className="font-semibold">{payment.amount}</p>
              <Button variant="outline" size="sm" type="button">
                <Download aria-hidden="true" />
                Receipt
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export { MyPaymentsPage };
