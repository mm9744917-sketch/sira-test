import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Callback() {
  useEffect(() => {
    const run = async () => {
      // يحوّل code الموجود بالرابط إلى session
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      // بعد ما يخلص يرجعك للصفحة الرئيسية
      window.location.replace(error ? "/?error=oauth" : "/");
    };

    run();
  }, []);

  return <p style={{ textAlign: "center", marginTop: 80 }}>Signing you in…</p>;
}
