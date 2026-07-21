export const vnpayConfig = {
  tmnCode: process.env.VNP_TMN_CODE!,
  hashSecret: process.env.VNP_HASH_SECRET!,
  url: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: process.env.VNP_RETURN_URL!, 
  apiUrl: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
};
