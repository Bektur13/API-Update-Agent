# Planted breaks: stripe-node v17 → v18 (API 2025-03-31.basil)

Each break below is planted on purpose in `stripe-legacy-demo`.
The agent should find and fix every "tsc" and "runtime" break,
and correctly ignore the "out of scope" one.

| # | Break | Detected by | Agent should |
|---|-------|-------------|--------------|
| 1 | Subscription period fields moved to items | tsc | Fix |
| 2 | Upcoming invoice → create preview | tsc (verify) | Fix |
| 3 | Issuing webhooks now send Accept: application/json | Not detectable in code | Ignore (out of scope) |
| 4 | Naver Pay params removed from PaymentMethod update | tsc | Fix |
| 5 | total_count expansion removed from lists | Runtime 400 only | Fix (changelog-only case) |

---

## 1. Subscription period fields moved to subscription items

- What changed: `current_period_start` and `current_period_end` no longer
  exist on the Subscription. Each subscription item now has its own period.
- Old (v17):
  ```ts
  const sub = await stripe.subscriptions.retrieve(subId);
  const renewsAt = sub.current_period_end;
  ```
- New (v18):
  ```ts
  const sub = await stripe.subscriptions.retrieve(subId);
  const renewsAt = sub.items.data[0].current_period_end;
  ```
- Detected by: tsc (property no longer exists on `Stripe.Subscription`).
- Watch out: `items.data[0]` assumes one item. With several items, periods
  can differ. The agent should mention this in the PR body.
- Source: https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-subscription-current-period-start-and-end

## 2. Upcoming Invoice API replaced by Create Preview

- What changed: retrieving an "upcoming invoice" was replaced by creating
  an invoice preview, with a changed parameter structure.
- Old (v17):
  ```ts
  const upcoming = await stripe.invoices.retrieveUpcoming({ customer: customerId });
  ```
- New (v18):
  ```ts
  const preview = await stripe.invoices.createPreview({ customer: customerId });
  ```
- Detected by: tsc, because `retrieveUpcoming` should no longer exist.
  VERIFY after upgrading, and check whether other params moved too.
- Source: https://github.com/stripe/stripe-node/wiki/Migration-guide-for-v18
  (Basil changelog: Upcoming Invoice API → Create Preview API)

## 3. Issuing real-time authorization webhooks request JSON (OUT OF SCOPE)

- What changed: these webhooks now send `Accept: application/json`.
  A webhook handler that can't answer in JSON may return 406, which
  can cause card authorizations to be declined.
- Old/New code: no Stripe SDK call changes. This affects the app's own
  HTTP webhook handler.
- Detected by: nothing in the agent's pipeline (no tsc error, no SDK call site).
- Agent should: NOT touch any code. Optionally mention it in the PR body
  as "manual check needed if you use Issuing."
- Source: https://docs.stripe.com/changelog/basil/2025-03-31/issuing-json-webhook

## 4. Naver Pay params can't be updated on a PaymentMethod

- What changed: `naver_pay` was removed from the PaymentMethod update
  params. It can only be set when creating the PaymentMethod.
- Old (v17):
  ```ts
  await stripe.paymentMethods.update(pmId, {
    naver_pay: { /* fields from your v17 types */ },
  });
  ```
- New (v18): remove the update. If the value must change, create a new
  PaymentMethod with the `naver_pay` params instead.
- Detected by: tsc (`naver_pay` no longer in `PaymentMethodUpdateParams`).
- Note: the right fix is a product decision (drop it vs. recreate the
  PaymentMethod). Good test of whether the agent explains its choice.
- Source: https://docs.stripe.com/changelog/basil/2025-03-31/naver-pay-payment-method

## 5. total_count expansion removed from list calls

- What changed: lists can no longer include `total_count`.
  Requests that ask for it get a 400 error (`property_forbidden`).
  Pagination must rely on `has_more` only.
- Old (v17):
  ```ts
  // include isn't in the typed params, so old code usually needs a cast
  const list = await stripe.customers.list(
    { limit: 100, include: ['total_count'] } as Stripe.CustomerListParams
  );
  const total = (list as any).total_count;
  ```
- New (v18):
  ```ts
  let count = 0;
  for await (const _customer of stripe.customers.list({ limit: 100 })) {
    count++;
  }
  ```
- Detected by: runtime 400 only. The cast hides it from tsc, so the agent
  must find it from the changelog + the code pattern (`total_count`).
- Note: counting by paging through everything is slow for big lists.
  The PR should say so.
- Source: https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-total-count-expansion