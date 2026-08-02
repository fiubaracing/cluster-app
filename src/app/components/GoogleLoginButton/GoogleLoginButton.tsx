"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import GoogleSVG from "./GoogleSVG";
import Button from "../Button";

export default function LoginButton() {
	const [status, setStatus] = useState("");

	const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setStatus('Verifying access token...');

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleAccessToken: tokenResponse.access_token,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setStatus(`Success: ${data.message}`);
        } else {
          setStatus(`Error: ${data.error}`);
        }
      } catch (error) {
        setStatus('Network error occurred.');
      }
    },
    onError: () => setStatus('Google Login Failed'),
  });

	return (
		<Button
			onClick={() => login()}
			className="cursor-pointer flex items-center justify-center w-full h-14 bg-surface border border-border rounded-xl text-foreground font-semibold hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm">
			<GoogleSVG />
			Continue with Google
		</Button>
	);
}
