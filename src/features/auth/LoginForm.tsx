"use client";
import { useActionState, useState } from "react";
import { loginAction, type LoginActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginActionState = {};
export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form action={formAction} className="login-form" aria-label="Đăng nhập">
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        fullWidth
        placeholder="Email của bạn"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <div className="password-field">
        <Input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          label="Mật khẩu"
          autoComplete="current-password"
          required
          fullWidth
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          className="password-toggle"
          type="button"
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="login-error">
          {state.error}
        </p>
      )}
      <Button type="submit" isLoading={pending} fullWidth>
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
