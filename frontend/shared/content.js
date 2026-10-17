export const DEFAULT_HOME_CONTENT = {
  siteTitle: 'Blossom Snaps — Photography & Stories',
  siteDescription: 'Blossom Snaps photography and private client galleries.',
  contactEmail: '',
  heroEyebrow: 'PHOTOGRAPHY · PEOPLE · PLACES',
  heroTitle: 'Little moments.',
  heroTitleAccent: 'Forever yours.',
  heroIntro: 'A home for the stories we capture and the memories we make together.',
  heroImageUrl: '',
  heroArtTitle: 'THE ART OF\nREMEMBERING',
  heroArtCaption: 'A LITTLE BIT OF MAGIC, EVERY DAY',
  heroIndex: 'EST. WITH LOVE · 2024',
  storiesEyebrow: 'FROM BEHIND THE LENS',
  storiesTitle: 'Notes &',
  storiesTitleAccent: 'stories',
  storiesEmptyTitle: 'Good things are on their way.',
  storiesEmptyDescription: 'Our latest stories will bloom here soon.',
  footerTagline: 'Stories worth keeping.',
};

export const HOME_CONTENT_FIELDS = [
  { key: 'siteTitle', label: 'Browser page title' },
  { key: 'siteDescription', label: 'Search description', multiline: true },
  { key: 'contactEmail', label: 'Enquiries email', type: 'email' },
  { key: 'heroEyebrow', label: 'Hero eyebrow' },
  { key: 'heroTitle', label: 'Hero title' },
  { key: 'heroTitleAccent', label: 'Hero emphasized title' },
  { key: 'heroIntro', label: 'Hero introduction', multiline: true },
  { key: 'heroImageUrl', label: 'Hero image URL (optional, HTTPS)', type: 'url' },
  { key: 'heroArtTitle', label: 'Hero artwork title', multiline: true },
  { key: 'heroArtCaption', label: 'Hero artwork caption' },
  { key: 'heroIndex', label: 'Hero footer note' },
  { key: 'storiesEyebrow', label: 'Stories eyebrow' },
  { key: 'storiesTitle', label: 'Stories title' },
  { key: 'storiesTitleAccent', label: 'Emphasized stories title' },
  { key: 'storiesEmptyTitle', label: 'Empty stories title' },
  { key: 'storiesEmptyDescription', label: 'Empty stories description', multiline: true },
  { key: 'footerTagline', label: 'Footer tagline' },
];

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T'));
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}
