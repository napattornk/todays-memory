import { forwardRef } from 'react'
import { STORY_WIDTH, STORY_HEIGHT } from '@/utils/image'
import { STORY_BACKGROUND_COLORS, type StoryMemoryViewModel } from '@/features/sharing/types'

/** Minimal, modern, editorial. The prompt is the social sharing hook. */
const MemoryCardTemplate = forwardRef<HTMLDivElement, { model: StoryMemoryViewModel }>(
  function MemoryCardTemplate({ model }, ref) {
    const colors = STORY_BACKGROUND_COLORS[model.background]
    return (
      <div
        ref={ref}
        style={{
          width: STORY_WIDTH,
          height: STORY_HEIGHT,
          background: colors.bg,
          color: colors.ink,
          fontFamily: 'var(--font-sans)',
          display: 'flex',
          flexDirection: 'column',
          padding: 72,
          boxSizing: 'border-box',
        }}
      >
        <p style={{ fontSize: 30, opacity: 0.7, margin: 0 }}>{model.dateLabel}</p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 56,
            lineHeight: 1.2,
            margin: '24px 0 40px',
          }}
        >
          {model.promptOrReflectionLabel}
        </h1>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            borderRadius: 24,
            overflow: 'hidden',
            background: 'rgba(0,0,0,0.05)',
          }}
        >
          <img
            src={model.photoUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
        {model.caption && (
          <p style={{ fontSize: 32, marginTop: 32, lineHeight: 1.4 }}>{model.caption}</p>
        )}
        <p style={{ fontSize: 24, opacity: 0.5, marginTop: 32, marginBottom: 0 }}>
          Today&rsquo;s Memory
        </p>
      </div>
    )
  },
)

export default MemoryCardTemplate
