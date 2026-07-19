import { forwardRef } from 'react'
import { STORY_WIDTH, STORY_HEIGHT } from '@/utils/image'
import { STORY_BACKGROUND_COLORS, type StoryMemoryViewModel } from '@/features/sharing/types'

/** Calm, reflective, editorial notebook page. */
const JournalTemplate = forwardRef<HTMLDivElement, { model: StoryMemoryViewModel }>(
  function JournalTemplate({ model }, ref) {
    const colors = STORY_BACKGROUND_COLORS[model.background]
    return (
      <div
        ref={ref}
        style={{
          width: STORY_WIDTH,
          height: STORY_HEIGHT,
          background: colors.bg,
          color: colors.ink,
          fontFamily: 'var(--font-serif)',
          display: 'flex',
          flexDirection: 'column',
          padding: '96px 80px',
          boxSizing: 'border-box',
        }}
      >
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 28, opacity: 0.65, margin: 0 }}>
          {model.dateLabel}
        </p>
        <p
          style={{
            fontSize: 44,
            fontStyle: 'italic',
            lineHeight: 1.35,
            margin: '28px 0 44px',
          }}
        >
          {model.promptOrReflectionLabel}
        </p>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            border: `1px solid ${colors.ink}22`,
            overflow: 'hidden',
          }}
        >
          <img
            src={model.photoUrl}
            alt=""
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
        {model.caption && (
          <p style={{ fontSize: 32, marginTop: 36, lineHeight: 1.5 }}>{model.caption}</p>
        )}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 22,
            opacity: 0.5,
            marginTop: 32,
            marginBottom: 0,
          }}
        >
          Today&rsquo;s Memory
        </p>
      </div>
    )
  },
)

export default JournalTemplate
