"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import {
  Smartphone, CreditCard, QrCode, Building2,
  CheckCircle, Loader2, Download, ArrowLeft, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const plans = [
  { id: "free", name: "مجاني", price: 0, period: "" },
  { id: "premium", name: "Premium", price: 39, period: "/شهر" },
  { id: "enterprise", name: "المؤسسات", price: null, period: "" },
];

const paymentMethods = [
  { id: "d17", name: "D17", icon: Smartphone, badge: "الأكثر شيوعاً في تونس", color: "text-emerald-500" },
  { id: "konnect", name: "Konnect", icon: CreditCard, badge: null, color: "text-blue-500" },
  { id: "flouci", name: "Flouci", icon: QrCode, badge: null, color: "text-purple-500" },
  { id: "bank", name: "تحويل بنكي", icon: Building2, badge: null, color: "text-orange-500" },
];

interface PaymentResult {
  payment_id: number;
  pay_url?: string;
  payment_url?: string;
  qr_code?: string;
  deep_link?: string;
  message?: string;
  setup_url?: string;
}

export default function PaymentPage() {
  const t = useTranslations("payment");
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [selectedMethod, setSelectedMethod] = useState("d17");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const handlePay = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let result: PaymentResult;

      switch (selectedMethod) {
        case "d17":
          result = await api.post<PaymentResult>("/payments/d17/initiate", {
            phone,
            plan: selectedPlan,
          }, token);
          break;

        case "konnect":
          result = await api.post<PaymentResult>("/payments/konnect/initiate", {
            plan: selectedPlan,
          }, token);
          break;

        case "flouci":
          result = await api.post<PaymentResult>("/payments/flouci/initiate", {
            plan: selectedPlan,
          }, token);
          break;

        case "bank":
          if (!proofFile) {
            setError("يرجى اختيار إثبات التحويل البنكي");
            setIsProcessing(false);
            return;
          }
          const formData = new FormData();
          formData.append("plan", selectedPlan);
          formData.append("proof", proofFile);
          result = await api.post<PaymentResult>("/payments/bank/submit-proof", formData, token);
          break;

        default:
          throw new Error("Unknown payment method");
      }

      setPaymentResult(result);

      if (result.pay_url) {
        window.location.href = result.pay_url;
      } else if (result.payment_url) {
        window.location.href = result.payment_url;
      }
    } catch (err: any) {
      const msg = err.message || "حدث خطأ أثناء المعالجة";
      if (msg.includes("D17 merchant credentials")) {
        setError("D17 غير متوفر حالياً. يرجى استخدام طريقة دفع أخرى أو الاتصال بالدعم.");
      } else {
        setError(msg);
      }
    }

    setIsProcessing(false);
  };

  if (paymentResult && !paymentResult.pay_url && !paymentResult.payment_url) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory-100 px-4">
        <div className="w-full max-w-md text-center">
          <div className="card">
            {selectedMethod === "d17" && paymentResult.qr_code ? (
              <>
                <img src={paymentResult.qr_code} alt="D17 QR Code" className="mx-auto mb-4 h-48 w-48" />
                <h1 className="mb-2 text-xl font-bold text-emerald-900">امسح الرمز بتطبيق D17</h1>
                <p className="mb-2 text-sm text-gray-500">{paymentResult.message}</p>
                {paymentResult.deep_link && (
                  <a href={paymentResult.deep_link} className="btn-primary mt-4 inline-flex items-center gap-2">
                    افتح تطبيق D17 <ExternalLink size={14} />
                  </a>
                )}
              </>
            ) : selectedMethod === "bank" ? (
              <>
                <CheckCircle className="mx-auto mb-4 text-emerald-600" size={64} />
                <h1 className="mb-2 text-2xl font-bold text-emerald-900">تم إرسال الإثبات</h1>
                <p className="mb-6 text-sm text-gray-500">سيتم مراجعة إثبات التحويل البنكي من قبل الإدارة</p>
              </>
            ) : (
              <>
                <CheckCircle className="mx-auto mb-4 text-emerald-600" size={64} />
                <h1 className="mb-2 text-2xl font-bold text-emerald-900">{t("success")}</h1>
                <p className="mb-6 text-sm text-gray-500">{t("successMessage")}</p>
              </>
            )}

            <div className="space-y-3">
              <button onClick={() => router.push("/dashboard")} className="btn-primary w-full">
                {t("goToDashboard")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 py-8">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          {t("selectPlan")}
        </button>

        <h1 className="mb-8 text-2xl font-bold text-emerald-900">{t("title")}</h1>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Selection */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-emerald-900">{t("selectPlan")}</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {plans.filter((p) => p.price !== null).map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "card text-center",
                      selectedPlan === plan.id && "border-emerald-600 ring-2 ring-emerald-600/20"
                    )}
                  >
                    <h3 className="font-semibold text-emerald-900">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-emerald-900">{plan.price}</span>
                      <span className="text-sm text-gray-500"> {t("plan")} {plan.period}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-emerald-900">{t("selectMethod")}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        "card flex flex-col items-center gap-2 py-4",
                        selectedMethod === method.id && "border-emerald-600 ring-2 ring-emerald-600/20"
                      )}
                    >
                      <Icon size={24} className={method.color} />
                      <span className="text-xs font-medium text-gray-700">{method.name}</span>
                      {method.badge && (
                        <span className="text-[10px] text-gold-600">{method.badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Form */}
            <div className="card">
              {selectedMethod === "d17" && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-emerald-900">{t("phone")}</h3>
                  <p className="mb-3 text-xs text-gray-500">
                    أدخل رقم هاتفك المرتبط بحساب D17. سيتم إرسال طلب الدفع إلى تطبيق D17.
                  </p>
                  <div className="flex">
                    <span className="flex items-center rounded-l-lg border border-r-0 border-ivory-300 bg-ivory-50 px-3 text-sm text-gray-500">
                      +216
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      className="input-field !rounded-l-none"
                      placeholder="12345678"
                      maxLength={8}
                    />
                  </div>
                </div>
              )}

              {selectedMethod === "konnect" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-900">الدفع عبر Konnect</h3>
                  <p className="text-xs text-gray-500">
                    ستتم إعادة توجيهك إلى صفحة الدفع الآمنة من Konnect. يمكنك الدفع بـ:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-medium text-blue-700">بطاقة بنكية</span>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-medium text-green-700">محفظة Konnect</span>
                    <span className="rounded-full bg-yellow-50 px-3 py-1 text-[10px] font-medium text-yellow-700">e-DINAR</span>
                  </div>
                </div>
              )}

              {selectedMethod === "flouci" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-900">الدفع عبر Flouci</h3>
                  <p className="text-xs text-gray-500">
                    ستتم إعادة توجيهك إلى صفحة الدفع الآمنة من Flouci. يمكنك الدفع بـ:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-medium text-purple-700">محفظة Flouci</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-medium text-blue-700">بطاقة بنكية</span>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-medium text-green-700">دفع محلي</span>
                  </div>
                </div>
              )}

              {selectedMethod === "bank" && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-ivory-50 p-4">
                    <p className="text-xs font-medium text-emerald-900 mb-2">معلومات التحويل البنكي:</p>
                    <p className="text-xs text-gray-500">اسم الحساب: EQUINOX Education</p>
                    <p className="text-xs text-gray-500">البنك: بنك تونس الدولي (BT)</p>
                    <p className="text-xs text-gray-500">RIB: 08 010 0000 123456789012 34</p>
                    <p className="text-xs text-gray-500">المبلغ: {plans.find((p) => p.id === selectedPlan)?.price} DT</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t("uploadProof")}</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="input-field file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:text-white"
                    />
                    <p className="mt-1 text-[10px] text-gray-400"> Formats: JPG, PNG, PDF - Max 5MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h2 className="mb-4 text-lg font-semibold text-emerald-900">{t("orderSummary")}</h2>
              <div className="space-y-3 border-b border-ivory-300 pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("plan")}</span>
                  <span className="font-medium text-emerald-900">
                    {plans.find((p) => p.id === selectedPlan)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("price")}</span>
                  <span className="font-medium text-emerald-900">
                    {plans.find((p) => p.id === selectedPlan)?.price} DT
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("duration")}</span>
                  <span className="font-medium text-emerald-900">شهر واحد</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">طريقة الدفع</span>
                  <span className="font-medium text-emerald-900">
                    {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                  </span>
                </div>
              </div>
              <div className="flex justify-between pt-4 text-base font-bold">
                <span className="text-emerald-900">{t("total")}</span>
                <span className="text-emerald-900">
                  {plans.find((p) => p.id === selectedPlan)?.price} DT
                </span>
              </div>
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="btn-primary mt-6 w-full"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  t("payNow")
                )}
              </button>
              <p className="mt-3 text-center text-[10px] text-gray-400">
                الدفع آمن ومشفر via SSL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
