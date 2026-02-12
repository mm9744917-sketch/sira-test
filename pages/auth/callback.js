export default function Callback() {
  if (typeof window !== "undefined") {
    // يرجعك للصفحة الرئيسية بعد ما Supabase يخلص
    window.location.href = "/";
  }
  return null;
}
