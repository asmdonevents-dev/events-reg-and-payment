-- Rename Flutterwave columns to Paystack and drop unused encryption key
ALTER TABLE "PaymentSettings" RENAME COLUMN "flwPublicKey" TO "paystackPublicKey";
ALTER TABLE "PaymentSettings" RENAME COLUMN "flwSecretKey" TO "paystackSecretKey";
ALTER TABLE "PaymentSettings" DROP COLUMN "flwEncryptionKey";
