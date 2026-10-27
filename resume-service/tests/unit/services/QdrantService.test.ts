import { describe, it, expect, vi, beforeEach } from 'vitest';

const { client, ctor } = vi.hoisted(() => ({ client: { upsert: vi.fn(), query: vi.fn(), delete: vi.fn(), scroll: vi.fn() }, ctor: vi.fn() }));
vi.mock('@qdrant/js-client-rest', () => ({
  QdrantClient: class { constructor(o: any) { ctor(o); Object.assign(this, client); } },
}));

import QdrantService, { qdrantService } from '../../../src/services/QdrantService';
import logger from '../../../src/utils/logger';

const ctorCallsAtImport = [...ctor.mock.calls];

const user = { id: 'u1', email: 'a@b.co', name: 'A', resumeId: 'r1', industry: 'Others' };

describe('QdrantService', () => {
  const svc = new QdrantService('custom');
  beforeEach(() => { Object.values(client).forEach((f) => f.mockReset()); });

  it('creates the client from env and exports a singleton', () => {
    expect(ctorCallsAtImport[0]).toEqual([{ url: 'http://localhost:6333', apiKey: 'test-qdrant-key' }]);
    expect(qdrantService).toBeInstanceOf(QdrantService);
  });

  it('falls back to the default collection name and host', async () => {
    delete process.env.QDRANT_HOST;
    ctor.mockClear();
    const d = new QdrantService();
    expect(ctor.mock.calls[0][0].url).toMatch(/^https:\/\//);
    process.env.QDRANT_HOST = 'http://localhost:6333';
    client.upsert.mockResolvedValue({ status: 'ok' });
    await d.uploadPoints([]);
    expect(client.upsert.mock.calls[0][0]).toBe('resume');
  });

  describe('uploadResumeToQdrant', () => {
    it('maps embeddings to points with payload and uploads to "resume"', async () => {
      client.upsert.mockResolvedValue({ status: 'completed', operation_id: 7 });
      const res = await svc.uploadResumeToQdrant([{ section: 'skills', embedding: [1, 2] }, { section: 'education', embedding: [3] }], user);
      expect(res).toEqual({ status: 'completed', operation_id: 7 });
      const [collection, body] = client.upsert.mock.calls[0];
      expect(collection).toBe('resume');
      expect(body.wait).toBe(true);
      expect(body.points).toHaveLength(2);
      expect(body.points[0]).toMatchObject({
        vector: [1, 2],
        payload: { industry: 'Others', 'candidate-id': 'u1', 'candidate-email': 'a@b.co', 'candidate-name': 'A', 'document-id': 'r1', is_active: true, section: 'skills' },
      });
      expect(body.points[0].id).toMatch(/^[0-9a-f-]{36}$/);
      expect(body.points[0].id).not.toBe(body.points[1].id);
    });
  });

  describe('uploadPoints', () => {
    it('uses the explicit collection, falling back to the default', async () => {
      client.upsert.mockResolvedValue({ status: 'ok' });
      await svc.uploadPoints([{ id: 1, vector: [1], payload: { section: 's', 'candidate-email': 'e' } }], 'other');
      expect(client.upsert.mock.calls[0][0]).toBe('other');
      await svc.uploadPoints([{ id: 1, vector: [1] }]);
      expect(client.upsert.mock.calls[1][0]).toBe('custom');
    });
    it('wraps failures in a generic error (Error and non-Error causes)', async () => {
      client.upsert.mockRejectedValueOnce(new Error('net'));
      await expect(svc.uploadPoints([])).rejects.toThrow('Failed to upload to Qdrant...');
      client.upsert.mockRejectedValueOnce('str');
      await expect(svc.uploadPoints([], 'c')).rejects.toThrow('Failed to upload to Qdrant...');
      expect(logger.error).toHaveBeenCalledWith('Error uploading points to Qdrant:', expect.objectContaining({ error: 'net', collection: 'custom' }));
    });
  });

  describe('globalSearch', () => {
    it('queries once per section without a filter', async () => {
      client.query.mockResolvedValue({ points: [] });
      const out = await svc.globalSearch([{ section: 'skills', embedding: [1] }, { section: 'education', embedding: [2] }], 3);
      expect(out).toEqual([{ section: 'skills', result: { points: [] } }, { section: 'education', result: { points: [] } }]);
      expect(client.query).toHaveBeenCalledWith('custom', { query: [1], limit: 3, with_payload: true });
    });
    it('defaults limit to 10 and accepts a collection', async () => {
      client.query.mockResolvedValue({ points: [] });
      await svc.globalSearch([{ section: 's', embedding: [1] }], undefined, 'col');
      expect(client.query).toHaveBeenCalledWith('col', expect.objectContaining({ limit: 10 }));
    });
    it('propagates errors', async () => {
      client.query.mockRejectedValue(new Error('x'));
      await expect(svc.globalSearch([{ section: 's', embedding: [1] }])).rejects.toThrow('x');
    });
  });

  describe('filteredSearch', () => {
    it('filters on candidate-id', async () => {
      client.query.mockResolvedValue({ points: [{ id: 1 }] });
      const out = await svc.filteredSearch([{ section: 'skills', embedding: [1] }], ['c1', 'c2'], 5, 'col');
      expect(out).toEqual([{ section: 'skills', result: { points: [{ id: 1 }] } }]);
      expect(client.query).toHaveBeenCalledWith('col', {
        query: [1], filter: { must: [{ key: 'candidate-id', match: { any: ['c1', 'c2'] } }] }, limit: 5, with_payload: true,
      });
    });
    it('uses the default collection', async () => {
      client.query.mockResolvedValue({ points: [] });
      await svc.filteredSearch([{ section: 's', embedding: [1] }], [], 1);
      expect(client.query.mock.calls[0][0]).toBe('custom');
    });
    it('logs and rethrows', async () => {
      client.query.mockRejectedValue(new Error('x'));
      await expect(svc.filteredSearch([{ section: 's', embedding: [1] }], [], 1)).rejects.toThrow('x');
      expect(logger.error).toHaveBeenCalledWith('Error performing filtered search:', expect.any(Error));
    });
  });

  describe('deletePointsByUserId', () => {
    it('returns ok without deleting when nothing exists', async () => {
      client.query.mockResolvedValue({ points: [] });
      await expect(svc.deletePointsByUserId('c1')).resolves.toEqual({ status: 'ok', operation_id: null });
      expect(client.delete).not.toHaveBeenCalled();
      expect(client.query.mock.calls[0][1].query).toHaveLength(1536);
    });
    it('deletes by candidate filter when points exist', async () => {
      client.query.mockResolvedValue({ points: [{ id: 1 }] });
      client.delete.mockResolvedValue({ status: 'completed', operation_id: 9 });
      await expect(svc.deletePointsByUserId('c1', 'col')).resolves.toEqual({ status: 'completed', operation_id: 9 });
      expect(client.delete).toHaveBeenCalledWith('col', { filter: { must: [{ key: 'candidate-id', match: { value: 'c1' } }] } });
    });
    it('wraps failures with a descriptive error', async () => {
      client.query.mockRejectedValue(new Error('x'));
      await expect(svc.deletePointsByUserId('c1')).rejects.toThrow('Failed to delete vector entries for candidate: c1');
    });
  });

  describe('getPointByResumeId', () => {
    it('returns null when nothing is found', async () => {
      client.scroll.mockResolvedValue({ points: [] });
      await expect(svc.getPointByResumeId('c1')).resolves.toBeNull();
    });
    it('groups points by known section and ignores others', async () => {
      client.scroll.mockResolvedValue({
        points: [
          { payload: { section: 'skills' }, vector: [1] },
          { payload: { section: 'experience' }, vector: [[1]] },
          { payload: { section: 'projects' }, vector: [3] },
          { payload: { section: 'education' }, vector: [4] },
          { payload: { section: 'project' }, vector: [5] },
          { payload: {}, vector: [6] },
          { vector: [7] },
        ],
      });
      const out = await svc.getPointByResumeId('c1', 'col');
      expect(Object.keys(out!).sort()).toEqual(['education', 'experience', 'projects', 'skills']);
      expect(out!.skills!.vector).toEqual([1]);
      expect(out!.experience!.vector).toEqual([[1]]);
      expect(client.scroll).toHaveBeenCalledWith('col', expect.objectContaining({ limit: 4, with_vector: true }));
    });
    it('uses empty vector when vector is not an array', async () => {
      client.scroll.mockResolvedValue({ points: [{ payload: { section: 'skills' }, vector: { a: [1] } }] });
      const out = await svc.getPointByResumeId('c1');
      expect(out!.skills!.vector).toEqual([]);
    });
    it('logs and rethrows', async () => {
      client.scroll.mockRejectedValue(new Error('x'));
      await expect(svc.getPointByResumeId('c1')).rejects.toThrow('x');
    });
  });
});
