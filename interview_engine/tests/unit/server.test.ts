import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { flushPromises } from '../helpers/testApp';

/**
 * src/server.ts creates the app, spawns python, wires socket.io and listens at import time,
 * so every collaborator is mocked and the module is re-imported per test.
 */
const h = vi.hoisted(() => ({
  py: null as any,
  io: null as any,
  httpServer: null as any,
  spawn: vi.fn(),
  connectDatabase: vi.fn(),
  updateIntegrity: vi.fn(),
  finalizeIntegrity: vi.fn(),
  markCompleted: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  createServer: vi.fn(),
  appRef: { app: null as any },
}));

vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));
vi.mock('child_process', () => ({ spawn: h.spawn }));
vi.mock('http', async () => {
  const actual = await vi.importActual<typeof import('http')>('http');
  return { ...actual, createServer: (app: any) => { h.appRef.app = app; return h.createServer(app); } };
});
vi.mock('socket.io', () => ({
  Server: class {
    handlers: Record<string, Function> = {};
    emit = vi.fn();
    to = vi.fn(() => ({ emit: this.emit }));
    constructor(public server: any, public opts: any) { h.io = this; }
    on(ev: string, fn: Function) { this.handlers[ev] = fn; }
  },
}));
vi.mock('../../src/config/database', () => ({ connectDatabase: h.connectDatabase }));
vi.mock('../../src/services/IntegrityService', () => ({
  intergrityService: { updateIntegrity: h.updateIntegrity, finalizeIntegrity: h.finalizeIntegrity },
}));
vi.mock('../../src/services/InterviewService', () => ({
  interviewService: { markInterviewAsCompleted: h.markCompleted },
}));
vi.mock('../../src/models/InterviewSchema', () => ({ Interview: { findByIdAndUpdate: h.findByIdAndUpdate } }));
vi.mock('../../src/routes/interview', async () => {
  const { Router } = await vi.importActual<typeof import('express')>('express');
  const r = Router();
  r.get('/ping', (_q, s) => { s.json({ routed: true }); });
  return { interviewRouter: r };
});

import request from 'supertest';

async function boot() {
  vi.resetModules();
  await import('../../src/server');
  await flushPromises();
}

function socketFor(query: any = { interviewId: 'int-1' }) {
  const handlers: Record<string, Function> = {};
  const socket = {
    handshake: { query },
    join: vi.fn(),
    on: vi.fn((ev: string, fn: Function) => { handlers[ev] = fn; }),
  };
  h.io.handlers.connection(socket);
  return { socket, handlers };
}

describe('server.ts', () => {
  let exit: any;
  beforeEach(() => {
    h.py = {
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
      stdin: { write: vi.fn() },
    };
    h.spawn.mockReturnValue(h.py);
    h.httpServer = { listen: vi.fn((_p: any, cb: () => void) => cb()) };
    h.createServer.mockReturnValue(h.httpServer);
    h.connectDatabase.mockResolvedValue(undefined);
    exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
    delete process.env.PORT;
  });
  afterEach(() => exit.mockRestore());

  describe('startup', () => {
    it('spawns the python worker, connects to the DB and listens on 4000 by default', async () => {
      await boot();
      expect(h.spawn).toHaveBeenCalledWith('venv/Scripts/python.exe', ['python/worker.py']);
      expect(h.io.opts).toEqual({ cors: { origin: '*' } });
      expect(h.connectDatabase).toHaveBeenCalled();
      expect(h.httpServer.listen).toHaveBeenCalledWith(4000, expect.any(Function));
      expect(console.log).toHaveBeenCalledWith('Interview service is listening on port 4000');
    });

    it('uses PORT from the environment', async () => {
      process.env.PORT = '5555';
      await boot();
      expect(h.httpServer.listen).toHaveBeenCalledWith('5555', expect.any(Function));
    });

    it('logs and exits(1) when startup fails', async () => {
      const err = new Error('no db');
      h.connectDatabase.mockRejectedValue(err);
      await boot();
      expect(console.log).toHaveBeenCalledWith('Failed to start server:', err);
      expect(exit).toHaveBeenCalledWith(1);
      expect(h.httpServer.listen).not.toHaveBeenCalled();
    });
  });

  describe('express app', () => {
    it('serves /health, mounts the interview router, enables CORS and handles errors', async () => {
      await boot();
      const app = h.appRef.app;
      const health = await request(app).get('/health');
      expect(health.status).toBe(200);
      expect(health.text).toBe('ok');

      const routed = await request(app).get('/api/interview/ping').set('Origin', 'http://x.test');
      expect(routed.body).toEqual({ routed: true });
      expect(routed.headers['access-control-allow-origin']).toBe('*');

      // malformed JSON hits the error middleware -> generic 500 payload
      const bad = await request(app).post('/api/interview/ping').set('Content-Type', 'application/json').send('{oops');
      expect(bad.status).toBe(500);
      expect(bad.body).toEqual({ success: false, message: 'Something went wrong!' });
    });
  });

  describe('python worker output', () => {
    it('emits the integrity score to the interview room', async () => {
      await boot();
      h.updateIntegrity.mockReturnValue({ aggregateScore: 0.9 });
      const metrics = { faceCount: 1, eyeContact: 1, speaking: 0, blinkRate: 0.1 };
      h.py.stdout.emit('data', Buffer.from(JSON.stringify({ interviewId: 'int-1', metrics })));
      expect(h.updateIntegrity).toHaveBeenCalledWith('int-1', metrics);
      expect(h.io.to).toHaveBeenCalledWith('int-1');
      expect(h.io.emit).toHaveBeenCalledWith('metrics', { aggregateScore: 0.9 });
    });

    it('logs (and survives) unparsable output', async () => {
      await boot();
      h.py.stdout.emit('data', Buffer.from('not json'));
      expect(console.error).toHaveBeenCalledWith('Error parsing Python output:', expect.any(SyntaxError));
      expect(h.io.emit).not.toHaveBeenCalled();
    });

    it('logs errors thrown while scoring', async () => {
      await boot();
      h.updateIntegrity.mockImplementation(() => { throw new Error('score'); });
      h.py.stdout.emit('data', Buffer.from(JSON.stringify({ interviewId: 'a', metrics: {} })));
      expect(console.error).toHaveBeenCalled();
    });

    it('routes stderr containing "error" to console.error, else console.log', async () => {
      await boot();
      h.py.stderr.emit('data', Buffer.from('Some ERROR happened'));
      expect(console.error).toHaveBeenCalledWith('Python error: Some ERROR happened');
      h.py.stderr.emit('data', Buffer.from('loaded model'));
      expect(console.log).toHaveBeenCalledWith('Python log: loaded model');
    });
  });

  describe('socket.io', () => {
    it('join-room joins the requested room', async () => {
      await boot();
      const { socket, handlers } = socketFor();
      handlers['join-room']('room-9');
      expect(socket.join).toHaveBeenCalledWith('room-9');
    });

    it('video-frames are forwarded to python stdin as newline-delimited JSON', async () => {
      await boot();
      const { handlers } = socketFor();
      const frame = { interviewId: 'int-1', frame: 'data:image/jpeg;base64,AAAA' };
      handlers['video-frames'](frame);
      expect(h.py.stdin.write).toHaveBeenCalledWith(JSON.stringify(frame) + '\n');
    });

    it('video-frames are dropped if python has no stdin', async () => {
      await boot();
      h.py.stdin = null;
      const { handlers } = socketFor();
      expect(() => handlers['video-frames']({ interviewId: 'x', frame: '' })).not.toThrow();
    });

    it('"disconnection" finalizes integrity and marks the interview completed', async () => {
      await boot();
      h.finalizeIntegrity.mockReturnValue({ finalScore: 0.75, details: null });
      const { handlers } = socketFor();
      handlers['disconnection']('int-7');
      expect(h.finalizeIntegrity).toHaveBeenCalledWith('int-7');
      expect(h.findByIdAndUpdate).toHaveBeenCalledWith('int-7', { $set: { integrityScore: 0.75 } });
      expect(h.markCompleted).toHaveBeenCalledWith('int-7');
    });

    it('registers the (non-standard) "disconnection" event but not socket.io\'s real "disconnect"', async () => {
      // BUG (source): socket.io emits "disconnect"; "disconnection" is never fired by the library,
      // so integrity finalization/completion never runs on a real disconnect.
      await boot();
      const { handlers } = socketFor();
      expect(Object.keys(handlers).sort()).toEqual(['disconnection', 'join-room', 'video-frames']);
    });
  });
});
