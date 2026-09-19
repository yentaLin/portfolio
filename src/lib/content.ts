import { getCollection } from 'astro:content';
export const getWriting = async () =>
  (await getCollection('writing', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
export const getProjects = async () =>
  (await getCollection('projects', ({ data }) => !data.draft)).sort(
    (a, b) =>
      a.data.order - b.data.order ||
      b.data.date.valueOf() - a.data.date.valueOf(),
  );
export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
export const readingTime = (body = '') =>
  Math.max(
    1,
    Math.ceil(
      (body.match(/[\u3400-\u9fff]/g)?.length || 0) / 400 +
        (body.match(/[a-zA-Z0-9]+/g)?.length || 0) / 220,
    ),
  );
