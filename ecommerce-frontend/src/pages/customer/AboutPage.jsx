export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">About Us</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        LumenStore is a modern e-commerce platform built to deliver a smooth shopping experience, quality products, and reliable service.
        We focus on customer satisfaction, secure payments, and fast order processing.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5 dark:border-slate-800"><h3 className="font-semibold">Quality Products</h3><p className="mt-2 text-sm text-slate-500">Carefully selected items for everyday needs.</p></div>
        <div className="rounded-xl border p-5 dark:border-slate-800"><h3 className="font-semibold">Secure Checkout</h3><p className="mt-2 text-sm text-slate-500">Safe payment options including KHQR and COD.</p></div>
        <div className="rounded-xl border p-5 dark:border-slate-800"><h3 className="font-semibold">Customer Support</h3><p className="mt-2 text-sm text-slate-500">We're here to help with your orders and questions.</p></div>
      </div>
    </div>
  );
}
