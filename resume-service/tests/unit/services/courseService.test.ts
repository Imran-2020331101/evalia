import { describe, it, expect, vi, beforeEach } from 'vitest';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('axios', () => ({ default: { get } }));

import { courseService } from '../../../src/services/courseService';

describe('courseService.searchYoutube', () => {
  beforeEach(() => { get.mockReset(); });

  const apiResponse = {
    data: {
      nextPageToken: 'NEXT',
      pageInfo: { totalResults: 42 },
      items: [
        { id: { videoId: 'v1' }, snippet: { title: 'T1', description: 'D1', channelId: 'c1', channelTitle: 'CT1', thumbnails: { default: { url: 'u' } }, publishedAt: '2024-01-01' } },
        { id: { videoId: 'v2' }, snippet: { title: 'T2', description: 'D2', channelId: 'c2', channelTitle: 'CT2', thumbnails: {}, publishedAt: '2024-02-02' } },
      ],
    },
  };

  it('calls the YouTube API and maps results', async () => {
    get.mockResolvedValue(apiResponse);
    const out = await courseService.searchYoutube('react tutorial', 5);
    const url = get.mock.calls[0][0] as string;
    expect(url).toContain('https://www.googleapis.com/youtube/v3/search');
    expect(url).toContain('key=yt-test');
    expect(url).toContain('q=react tutorial');
    expect(url).toContain('maxResults=5');
    expect(out.nextPageToken).toBe('NEXT');
    expect(out.totalResults).toBe(42);
    expect(out.courses).toHaveLength(2);
    expect(out.courses[0]).toEqual({ videoId: 'v1', title: 'T1', description: 'D1', channelId: 'c1', channelTitle: 'CT1', thumbnails: { default: { url: 'u' } }, publishedAt: '2024-01-01' });
  });

  it('defaults maxResults to 20', async () => {
    get.mockResolvedValue(apiResponse);
    await courseService.searchYoutube('x');
    expect(get.mock.calls[0][0]).toContain('maxResults=20');
  });

  it('propagates API failures', async () => {
    get.mockRejectedValue(new Error('quota'));
    await expect(courseService.searchYoutube('x')).rejects.toThrow('quota');
  });

  it('throws when pageInfo is missing from the response', async () => {
    get.mockResolvedValue({ data: { items: [] } });
    await expect(courseService.searchYoutube('x')).rejects.toThrow();
  });
});
