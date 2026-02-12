import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Callback() {
  useEffect(() => {
    const run = async () => {
      try {
        // يحوّل "الكود" اللي بالرابط إلى Session
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch (e) {
        // حتى لو صار خطأ، رجّع للصفحة الرئيسية
      } finally {
        window.location.replace("/");
      }
    };
    run();
  }, []);

  return null;
}
