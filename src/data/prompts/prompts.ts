import type { Prompt, PromptCategory } from '@/types/prompt'

type SeedPrompt = { id: string; text: string; category: PromptCategory; tone?: string }

// 60+ prompts, deliberately avoiding generic photography challenges
// ("photograph something red") in favor of reflective, memory-oriented cues.
const SEED_PROMPTS: SeedPrompt[] = [
  // notice
  { id: 'notice-01', text: 'What made today feel different?', category: 'notice' },
  { id: 'notice-02', text: 'A moment you almost overlooked.', category: 'notice' },
  { id: 'notice-03', text: 'Something you noticed because you slowed down.', category: 'notice' },
  { id: 'notice-04', text: 'What caught your attention without asking for it?', category: 'notice' },
  { id: 'notice-05', text: 'Something that only existed today.', category: 'notice' },
  { id: 'notice-06', text: 'A detail you might forget by next week.', category: 'notice' },
  { id: 'notice-07', text: 'What did today sound like, if you had to remember one thing?', category: 'notice' },
  { id: 'notice-08', text: 'Something small that felt worth noticing.', category: 'notice' },

  // gratitude
  { id: 'gratitude-01', text: 'Something you were quietly grateful for today.', category: 'gratitude' },
  { id: 'gratitude-02', text: 'A small kindness you received or gave.', category: 'gratitude' },
  { id: 'gratitude-03', text: 'What made today easier than it could have been?', category: 'gratitude' },
  { id: 'gratitude-04', text: 'Something ordinary you would miss if it were gone.', category: 'gratitude' },
  { id: 'gratitude-05', text: 'A comfort you did not have to think twice about.', category: 'gratitude' },
  { id: 'gratitude-06', text: 'Something that made today a little lighter.', category: 'gratitude' },
  { id: 'gratitude-07', text: 'Who or what carried you through today?', category: 'gratitude' },
  { id: 'gratitude-08', text: 'A moment you were thankful to simply be there for.', category: 'gratitude' },

  // people
  { id: 'people-01', text: 'Who made today a little better?', category: 'people' },
  { id: 'people-02', text: 'A small moment of connection.', category: 'people' },
  { id: 'people-03', text: 'Someone you thought of today, even briefly.', category: 'people' },
  { id: 'people-04', text: 'A conversation that stayed with you.', category: 'people' },
  { id: 'people-05', text: 'Who did you notice more closely today?', category: 'people' },
  { id: 'people-06', text: 'Someone who made the ordinary parts of today feel less ordinary.', category: 'people' },
  { id: 'people-07', text: 'A shared moment, even a quiet one.', category: 'people' },
  { id: 'people-08', text: 'Who would you want to remember this day with?', category: 'people' },

  // place
  { id: 'place-01', text: 'Where did you feel most like yourself?', category: 'place' },
  { id: 'place-02', text: 'A place that held today well.', category: 'place' },
  { id: 'place-03', text: 'Somewhere ordinary that felt worth remembering.', category: 'place' },
  { id: 'place-04', text: 'A corner of your day you did not expect to notice.', category: 'place' },
  { id: 'place-05', text: 'Where did today slow down, even briefly?', category: 'place' },
  { id: 'place-06', text: 'A place that will not look the same forever.', category: 'place' },
  { id: 'place-07', text: 'Somewhere that felt familiar in a good way.', category: 'place' },
  { id: 'place-08', text: 'Where were you when today felt most real?', category: 'place' },

  // change
  { id: 'change-01', text: 'Something that changed, even slightly.', category: 'change' },
  { id: 'change-02', text: 'Something that will not look the same forever.', category: 'change' },
  { id: 'change-03', text: 'A small shift you noticed in yourself today.', category: 'change' },
  { id: 'change-04', text: 'Something that is different now than it was this morning.', category: 'change' },
  { id: 'change-05', text: 'A part of today that will not happen quite this way again.', category: 'change' },
  { id: 'change-06', text: 'Something you are seeing differently lately.', category: 'change' },
  { id: 'change-07', text: 'What quietly moved forward today?', category: 'change' },
  { id: 'change-08', text: 'A small ending or beginning you noticed.', category: 'change' },

  // emotion
  { id: 'emotion-01', text: 'The best five minutes of your day.', category: 'emotion' },
  { id: 'emotion-02', text: 'What did today ask of you emotionally?', category: 'emotion' },
  { id: 'emotion-03', text: 'A feeling that surprised you today.', category: 'emotion' },
  { id: 'emotion-04', text: 'What settled you today, even briefly?', category: 'emotion' },
  { id: 'emotion-05', text: 'A moment that felt lighter than expected.', category: 'emotion' },
  { id: 'emotion-06', text: 'Something that quietly moved you.', category: 'emotion' },
  { id: 'emotion-07', text: 'What did today feel like, in one honest moment?', category: 'emotion' },
  { id: 'emotion-08', text: 'A feeling worth remembering, even a small one.', category: 'emotion' },

  // growth
  { id: 'growth-01', text: 'What would future you want to remember?', category: 'growth' },
  { id: 'growth-02', text: 'Something you understood a little better today.', category: 'growth' },
  { id: 'growth-03', text: 'A small step you took, even if it did not feel like one.', category: 'growth' },
  { id: 'growth-04', text: 'What did today teach you, without meaning to?', category: 'growth' },
  { id: 'growth-05', text: 'Something you handled differently than you once would have.', category: 'growth' },
  { id: 'growth-06', text: 'A moment you were proud of, however small.', category: 'growth' },
  { id: 'growth-07', text: 'What are you carrying forward from today?', category: 'growth' },
  { id: 'growth-08', text: 'Something that felt like progress, quietly.', category: 'growth' },

  // ordinary-life
  { id: 'ordinary-01', text: 'Something ordinary that felt meaningful.', category: 'ordinary-life' },
  { id: 'ordinary-02', text: 'A part of your routine worth remembering.', category: 'ordinary-life' },
  { id: 'ordinary-03', text: 'What gave today its character?', category: 'ordinary-life' },
  { id: 'ordinary-04', text: 'Something you may miss one day.', category: 'ordinary-life' },
  { id: 'ordinary-05', text: 'An unremarkable moment that was still yours.', category: 'ordinary-life' },
  { id: 'ordinary-06', text: 'What made today feel like your life, specifically?', category: 'ordinary-life' },
  { id: 'ordinary-07', text: 'A small routine that quietly held today together.', category: 'ordinary-life' },
  { id: 'ordinary-08', text: 'Something plain that you would still want to remember.', category: 'ordinary-life' },
]

// Sort by id (not array order) so the rotation is stable even if this file's
// literal ordering is later edited or the prompts are reorganized.
const STABLE_ORDER = [...SEED_PROMPTS].sort((a, b) => a.id.localeCompare(b.id))

export const PROMPTS: Prompt[] = STABLE_ORDER.map((p, index) => ({
  ...p,
  rotationIndex: index,
}))

export const PROMPTS_BY_ID: ReadonlyMap<string, Prompt> = new Map(
  PROMPTS.map((p) => [p.id, p]),
)
