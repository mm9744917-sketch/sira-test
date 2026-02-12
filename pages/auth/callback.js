import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Callback() {
  useEffect(() => {
    const run = async () => {
      // هذا السطر هو اللي “يحوّل” الرابط لجلسة تسجيل دخول
      await supabase.auth.exchangeCodeForSession(window.location.href);

      // بعد نجاح تسجيل الدخول ارجع للصفحة الرئيسية
      window.location.replace("/");
    };

    run();
  }, []);

  return null;
}
