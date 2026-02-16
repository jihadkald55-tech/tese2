/**
 * Supabase Connection Debug Script
 * اختبار اتصال Supabase
 */

const supabaseUrl = "https://duntvpipicwqyhrpdvm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bnR2cGlwaWN3cXl5aHJwZHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDkzOTIsImV4cCI6MjA4NjMyNTM5Mn0.MWkj4Hbw1eJzP0rhNWyFo5e8i41iV-BF14LeciQLrkM";

console.log("🔍 اختبار اتصال Supabase...\n");
console.log("URL:", supabaseUrl);
console.log("API Key Length:", supabaseAnonKey.length);
console.log("API Key Valid Format:", supabaseAnonKey.includes("."));

// اختبار الاتصال
fetch(`${supabaseUrl}/rest/v1/`, {
  headers: {
    Authorization: `Bearer ${supabaseAnonKey}`,
    apikey: supabaseAnonKey,
  },
})
  .then((response) => {
    console.log("\n✅ اتصال Supabase يعمل!");
    console.log("Status Code:", response.status);
    return response.json();
  })
  .catch((error) => {
    console.error("\n❌ خطأ في الاتصال:");
    console.error(error);
  });

// اختبار التحقق
console.log("\n🔐 اختبار المصادقة...");
fetch(`${supabaseUrl}/auth/v1/user`, {
  headers: {
    Authorization: `Bearer ${supabaseAnonKey}`,
    apikey: supabaseAnonKey,
  },
})
  .then((response) => {
    console.log("Auth Response Status:", response.status);
    return response.text();
  })
  .then((data) => {
    console.log("Response:", data);
  })
  .catch((error) => {
    console.error("Auth Error:", error);
  });
