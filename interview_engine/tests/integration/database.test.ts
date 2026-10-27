import { describe, it, expect, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { connectDatabase } from '../../src/config/database';
import { Interview } from '../../src/models/InterviewSchema';
import { InterviewEvaluation } from '../../src/models/InterviewEvaluationSchema';

/**
 * mongodb-memory-server is intentionally not used (it downloads a mongod binary);
 * instead real mongoose models are exercised with the driver call mocked out.
 */
describe('database integration (mongoose, no real MongoDB)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('connectDatabase hands MONGODB_URI to mongoose and wires real connection events', async () => {
    const connect = vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
    const before = mongoose.connection.listenerCount('error');
    await connectDatabase();
    expect(connect).toHaveBeenCalledWith('mongodb://test-host:27017/test-db');
    expect(mongoose.connection.listenerCount('error')).toBe(before + 1);

    mongoose.connection.emit('disconnected');
    expect(console.log).toHaveBeenCalledWith('MongoDB disconnected');
    mongoose.connection.emit('error', new Error('socket closed'));
    expect(console.error).toHaveBeenCalledWith('MongoDB connection error:', expect.any(Error));
    mongoose.connection.removeAllListeners('error');
    mongoose.connection.removeAllListeners('disconnected');
  });

  it('connectDatabase exits when mongoose.connect rejects', async () => {
    vi.spyOn(mongoose, 'connect').mockRejectedValue(new Error('refused'));
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
    await connectDatabase();
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('Interview.save() rejects invalid documents before touching the database', async () => {
    const doc = new Interview({ candidateName: 'x' });
    await expect(doc.save()).rejects.toMatchObject({ name: 'ValidationError' });
  });

  it('InterviewEvaluation.save() rejects invalid documents before touching the database', async () => {
    await expect(new InterviewEvaluation({}).save()).rejects.toMatchObject({ name: 'ValidationError' });
  });

  it('save() on a valid Interview goes through the driver collection (mocked)', async () => {
    const insertOne = vi.fn().mockResolvedValue({ acknowledged: true });
    vi.spyOn(Interview.collection, 'insertOne').mockImplementation(insertOne as any);
    const doc = new Interview({
      candidateId: new mongoose.Types.ObjectId(), candidateEmail: 'A@B.C', candidateName: 'n',
      jobId: new mongoose.Types.ObjectId(), jobTitle: 't', deadline: new Date(),
      questionsAnswers: [{ question: 'q' }],
    });
    // Without a connection mongoose buffers; disable buffering so insertOne is called directly.
    Interview.collection.conn.set?.('bufferCommands', false);
    (Interview.collection as any).buffer = false;
    await doc.save();
    expect(insertOne).toHaveBeenCalledOnce();
    expect(insertOne.mock.calls[0][0].candidateEmail).toBe('a@b.c');
    expect(doc.isNew).toBe(false);
  });
});
