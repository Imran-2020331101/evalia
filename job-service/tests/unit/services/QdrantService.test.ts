import { describe, it, expect, vi, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({
  upsert: vi.fn(), query: vi.fn(), delete: vi.fn(), scroll: vi.fn(), opts: undefined as any,
}));
vi.mock('@qdrant/js-client-rest', () => ({
  QdrantClient: class {
    upsert = h.upsert; query = h.query; delete = h.delete; scroll = h.scroll;
    constructor(o: any) { h.opts = o; }
  },
}));
vi.mock('../../../src/config/logger', () => ({ default: { info: vi.fn(), error: vi.fn() } }));

import QdrantDefault, { QdrantService, qdrantService } from '../../../src/services/QdrantService';
import logger from '../../../src/config/logger';

describe('QdrantService', () => {
  let svc: QdrantService;
  beforeEach(() => { svc = new QdrantService('custom'); });

  it('builds the client from env and exposes a singleton/default export', () => {
    expect(h.opts).toEqual({ url: 'http://qdrant.test', apiKey: 'test-qdrant-key' });
    expect(QdrantDefault).toBe(QdrantService);
    expect(qdrantService).toBeInstanceOf(QdrantService);
  });

  describe('uploadPoints', () => {
    const pts: any = [{ id: '1', vector: [1], payload: { section: 'skills' } }];
    it('upserts into the explicit collection', async () => {
      h.upsert.mockResolvedValue({ status: 'completed', operation_id: 7 });
      await expect(svc.uploadPoints(pts, 'explicit')).resolves.toEqual({ status: 'completed', operation_id: 7 });
      expect(h.upsert).toHaveBeenCalledWith('explicit', { wait: true, points: pts });
    });
    it('falls back to the default collection', async () => {
      h.upsert.mockResolvedValue({});
      await svc.uploadPoints(pts);
      expect(h.upsert).toHaveBeenCalledWith('custom', expect.anything());
    });
    it('wraps failures in a generic error (Error instance)', async () => {
      h.upsert.mockRejectedValue(new Error('net'));
      await expect(svc.uploadPoints(pts)).rejects.toThrow('Failed to upload to Qdrant...');
      expect(logger.error).toHaveBeenCalledWith('Error uploading points to Qdrant:', expect.objectContaining({ error: 'net', collection: 'custom' }));
    });
    it('wraps failures with non-Error rejections', async () => {
      h.upsert.mockRejectedValue('str');
      await expect(svc.uploadPoints(pts, 'c')).rejects.toThrow('Failed to upload');
      expect(logger.error).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ error: 'str', collection: 'c' }));
    });
  });

  describe('uploadJobToQdrant', () => {
    it('maps embeddings to payload-carrying points and always uses the "jobs" collection', async () => {
      h.upsert.mockResolvedValue({ status: 'ok' });
      await svc.uploadJobToQdrant(
        [{ section: 'skills', embedding: [1, 2] }, { section: 'education', embedding: [3] }],
        { id: 'job1', industry: 'STEM & Technical', organizationId: 'org' },
      );
      const [collection, body] = h.upsert.mock.calls[0];
      expect(collection).toBe('jobs');
      expect(body.points).toHaveLength(2);
      expect(body.points[0]).toMatchObject({
        vector: [1, 2],
        payload: { industry: 'STEM & Technical', 'document-id': 'job1', is_active: true, section: 'skills' },
      });
      expect(body.points[0].id).toMatch(/^[0-9a-f-]{36}$/);
      expect(body.points[0].id).not.toBe(body.points[1].id);
    });
  });

  describe('globalJobSearchUsingResume', () => {
    it('queries once per defined section and skips empty ones', async () => {
      h.query.mockResolvedValue({ points: [] });
      const res = await svc.globalJobSearchUsingResume(
        { skills: { vector: [1], payload: {} }, experience: undefined, projects: { vector: [2], payload: {} } }, 5, 'col',
      );
      expect(h.query).toHaveBeenCalledTimes(2);
      expect(h.query).toHaveBeenCalledWith('col', { query: [1], limit: 5, with_payload: true });
      expect(res.map((r) => r.section)).toEqual(['skills', 'projects']);
    });
    it('uses defaults for limit and collection', async () => {
      h.query.mockResolvedValue({ points: [] });
      await svc.globalJobSearchUsingResume({ skills: { vector: [1], payload: {} } });
      expect(h.query).toHaveBeenCalledWith('custom', { query: [1], limit: 10, with_payload: true });
    });
    it('propagates errors', async () => {
      h.query.mockRejectedValue(new Error('q'));
      await expect(svc.globalJobSearchUsingResume({ skills: { vector: [1], payload: {} } })).rejects.toThrow('q');
    });
  });

  describe('filteredSearch', () => {
    it('filters by candidate ids for each section', async () => {
      h.query.mockResolvedValue({ points: [] });
      const res = await svc.filteredSearch([{ section: 'skills', embedding: [1] }, { section: 'projects', embedding: [2] }], ['c1', 'c2'], 3, 'col');
      expect(h.query).toHaveBeenCalledWith('col', {
        query: [1],
        filter: { must: [{ key: 'candidate-id', match: { any: ['c1', 'c2'] } }] },
        limit: 3,
        with_payload: true,
      });
      expect(res).toHaveLength(2);
    });
    it('defaults the collection', async () => {
      h.query.mockResolvedValue({ points: [] });
      await svc.filteredSearch([{ section: 's', embedding: [1] }], [], 1);
      expect(h.query.mock.calls[0][0]).toBe('custom');
    });
    it('logs and rethrows', async () => {
      h.query.mockRejectedValue(new Error('x'));
      await expect(svc.filteredSearch([{ section: 's', embedding: [1] }], [], 1)).rejects.toThrow('x');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deletePointsByJobId', () => {
    it('returns an ok no-op when nothing exists', async () => {
      h.query.mockResolvedValue({ points: [] });
      await expect(svc.deletePointsByJobId('j1')).resolves.toEqual({ status: 'ok', operation_id: null });
      expect(h.query.mock.calls[0][1].query).toHaveLength(1536);
      expect(h.query.mock.calls[0][1].filter).toEqual({ must: { key: 'document-id', match: 'j1' } });
      expect(h.delete).not.toHaveBeenCalled();
    });
    it('deletes when points exist (note: delete filter uses "candidate-id" key)', async () => {
      h.query.mockResolvedValue({ points: [{ id: 1 }] });
      h.delete.mockResolvedValue({ status: 'completed' });
      await expect(svc.deletePointsByJobId('j1', 'col')).resolves.toEqual({ status: 'completed' });
      expect(h.delete).toHaveBeenCalledWith('col', { filter: { must: { key: 'candidate-id', match: 'j1' } }, wait: true });
    });
    it('wraps any failure', async () => {
      h.query.mockRejectedValue(new Error('x'));
      await expect(svc.deletePointsByJobId('j1')).rejects.toThrow('Failed to delete vector entries for job: j1');
    });
  });

  describe('getPointByJobId', () => {
    it('scrolls with a document-id filter', async () => {
      h.scroll.mockResolvedValue({ points: [{ id: 1 }] });
      await expect(svc.getPointByJobId('j1', 'col')).resolves.toEqual({ points: [{ id: 1 }] });
      expect(h.scroll).toHaveBeenCalledWith('col', {
        filter: { must: [{ key: 'document-id', match: { value: 'j1' } }] },
        limit: 1, with_payload: true, with_vector: false,
      });
    });
    it('defaults the collection and rethrows on error', async () => {
      h.scroll.mockResolvedValue({ points: [] });
      await svc.getPointByJobId('j1');
      expect(h.scroll.mock.calls[0][0]).toBe('custom');
      h.scroll.mockRejectedValue(new Error('s'));
      await expect(svc.getPointByJobId('j1')).rejects.toThrow('s');
    });
  });
});
