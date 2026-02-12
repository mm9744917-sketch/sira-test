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
        // 1) لو الرابط فيه #access_token و refresh_token (غالباً magic link)
        const hash = window.location.hash?.startsWith("#")
          ? window.location.hash.slice(1)
          : "";
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          window.location.replace("/");
          return;
        }

        // 2) لو الرابط فيه ?code= (أحياناً)
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          window.location.replace("/");
          return;
        }

        // 3) إذا ما في شي من فوق
        window.location.replace("/?auth=missing_tokens");
      } catch (e) {
        window.location.replace("/?auth=callback_error");
      }
    };

    run();
  }, []);

  return null;
}
