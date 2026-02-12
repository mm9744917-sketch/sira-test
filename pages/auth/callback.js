import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Callback() {
  useEffect(() => {
    const handleAuth = async () => {
      await supabase.auth.getSession();
      window.location.href = "/";
    };

    handleAuth();
  }, []);

  return <p>Logging you in...</p>;
}
