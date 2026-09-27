import { LineBullet } from "@/components/brand/line-bullet"
import { SignBand } from "@/components/brand/sign-band"
import { Wordmark } from "@/components/brand/wordmark"

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <Wordmark />
      <h1 className="font-display text-display-xl">New York, by craving</h1>
      <SignBand
        title="Eat"
        bullets={
          <LineBullet line="red" size="sm">
            E
          </LineBullet>
        }
      />
    </main>
  )
}
