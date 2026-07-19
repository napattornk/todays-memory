import { forwardRef } from 'react'
import { STORY_WIDTH, STORY_HEIGHT } from '@/utils/image'
import { STORY_BACKGROUND_COLORS, type StoryMemoryViewModel } from '@/features/sharing/types'

/** Warm, nostalgic, instant-photo inspired. */
const PolaroidTemplate = forwardRef<HTMLDivElement, { model: StoryMemoryViewModel }>(
  function PolaroidTemplate({ model }, ref) {
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
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 860,
            background: '#fffdf8',
            color: '#241f28',
            borderRadius: 8,
            padding: '48px 48px 64px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              width: '100%',
              height: 900,
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
          <p style={{ fontSize: 28, opacity: 0.6, margin: '32px 0 8px' }}>{model.dateLabel}</p>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 40, lineHeight: 1.3, margin: 0 }}>
            {model.promptOrReflectionLabel}
          </p>
          {model.caption && (
            <p style={{ fontSize: 28, marginTop: 20, lineHeight: 1.4 }}>{model.caption}</p>
          )}
          <p style={{ fontSize: 22, opacity: 0.4, marginTop: 24, marginBottom: 0 }}>
            Today&rsquo;s Memory
          </p>
        </div>
      </div>
    )
  },
)

export default PolaroidTemplate
