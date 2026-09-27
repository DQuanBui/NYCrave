"use client"

import { useActionState } from "react"
import {
  editorAction,
  loginAction,
  syncSeedAction,
  type ActionState,
} from "@/app/[locale]/admin/actions"
import { cn } from "@/lib/utils"

const button =
  "inline-flex h-10 items-center rounded-full px-5 text-sm font-bold transition-colors disabled:opacity-60"

function Feedback({ state }: { state: ActionState }) {
  return (
    <div aria-live="polite" className="space-y-1 text-sm">
      {state.ok ? <p className="font-semibold text-free">{state.ok}</p> : null}
      {state.errors?.length ? (
        <ul className="list-disc space-y-0.5 pl-5 font-medium text-destructive">
          {state.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {})
  return (
    <form action={action} className="max-w-sm space-y-3">
      <label htmlFor="password" className="block text-sm font-bold">
        Admin password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="h-11 w-full rounded-xl border-2 border-foreground/15 bg-card px-3"
      />
      <button
        type="submit"
        disabled={pending}
        className={cn(button, "bg-foreground text-background")}
      >
        Sign in
      </button>
      <Feedback state={state} />
    </form>
  )
}

export function SyncSeedButton() {
  const [state, action, pending] = useActionState(syncSeedAction, {})
  return (
    <form action={action} className="space-y-2">
      <button type="submit" disabled={pending} className={cn(button, "border-2 border-foreground")}>
        Sync seed JSON to Supabase
      </button>
      <Feedback state={state} />
    </form>
  )
}

export function PlaceEditor({
  initialJson,
  googleEnabled,
}: {
  initialJson: string
  googleEnabled: boolean
}) {
  const [state, action, pending] = useActionState(editorAction, { json: initialJson })
  const json = state.json ?? initialJson

  return (
    <form action={action} className="space-y-4">
      <label htmlFor="place-json" className="block text-sm font-bold">
        Place JSON
      </label>
      <p id="place-json-hint" className="text-sm text-muted-foreground">
        Validated against the schema in types/place.ts on save. Hours are HH:MM in New York time; a
        close at or before the open time runs past midnight.
      </p>
      <textarea
        key={json}
        id="place-json"
        name="json"
        defaultValue={json}
        aria-describedby="place-json-hint"
        spellCheck={false}
        rows={32}
        className="w-full rounded-xl border-2 border-foreground/15 bg-card p-4 font-mono text-sm leading-relaxed"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          name="intent"
          value="save"
          disabled={pending}
          className={cn(button, "bg-taxi text-taxi-foreground")}
        >
          Save place
        </button>
        {googleEnabled ? (
          <button
            type="submit"
            name="intent"
            value="google"
            disabled={pending}
            className={cn(button, "border-2 border-foreground")}
          >
            Fill hours, phone and website from Google
          </button>
        ) : null}
      </div>
      <Feedback state={state} />
    </form>
  )
}
