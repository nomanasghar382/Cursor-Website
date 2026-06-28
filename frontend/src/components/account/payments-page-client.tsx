"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Download, Receipt, Wallet } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { customerApi } from "@/lib/api/customer";
import { formatCurrency } from "@/lib/utils";

type PaymentsData = Awaited<ReturnType<typeof customerApi.payments>>;

export function PaymentsPageClient() {
  const { token, ready } = useRequireAuth("/login?next=/account/payments");
  const [data, setData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !token) return;
    void customerApi.payments(token).then(setData).finally(() => setLoading(false));
  }, [ready, token]);

  if (loading) {
    return <p className="text-muted-foreground">Loading payments...</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Payments & billing"
        description="Saved payment methods, wallet architecture, transactions, and invoices."
        icon={CreditCard}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-primary" />
              Wallet architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.architecture.map((gateway) => (
              <Badge key={gateway} variant="secondary">
                {gateway}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle className="text-lg">Saved payment methods</CardTitle>
          </CardHeader>
          <CardContent>
            {data.savedMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Payment methods are tokenized at checkout. Complete a purchase to enable saved cards.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">{data.savedMethods.length} saved methods</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Recent transactions</h2>
        {data.transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Your payment history will appear here after your first purchase."
            icon={Receipt}
          />
        ) : (
          <div className="space-y-3">
            {data.transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border border-border/60 px-5 py-4"
              >
                <div>
                  <p className="font-medium">{transaction.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.gateway} · {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{transaction.status}</Badge>
                  <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Invoices</h2>
        {data.invoices.length === 0 ? (
          <EmptyState title="No invoices" description="Invoices are generated when orders are confirmed." icon={Download} />
        ) : (
          <div className="space-y-3">
            {data.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border border-border/60 px-5 py-4"
              >
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">Order {invoice.orderNumber}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : "Pending issue"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Billing history</h2>
        <div className="space-y-3">
          {data.billingHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border border-border/60 px-5 py-4"
            >
              <div>
                <p className="font-medium">{entry.label}</p>
                <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{entry.status}</Badge>
                <p className="font-semibold">{formatCurrency(entry.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
