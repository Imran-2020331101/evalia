import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { getApp } from '../helpers/testApp';
import connectDB from '../../src/config/database';

let app: Application;
let connectCalls = 0;
beforeAll(async () => { app = await getApp(); connectCalls = (connectDB as any).mock.calls.length; });

describe('app', () => {
  it('kicks off the DB connection on import (mocked)', () => {
    expect(vi.isMockFunction(connectDB)).toBe(true);
    expect(connectCalls).toBe(1);
  });

  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: 'Resume Service is healthy' });
    expect(typeof res.body.uptime).toBe('number');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('GET / lists endpoints', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Welcome to Evalia Resume Service');
    expect(res.body.endpoints).toEqual({ health: '/health', api: '/api', upload: '/api/resume/upload', extract: '/api/resume/extract-details' });
  });

  it('GET /api/health is routed', async () => {
    expect((await request(app).get('/api/health')).body.message).toBe('Evalia AI Server is running');
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(app).post('/nope/x?y=1');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, error: 'Route not found', message: 'POST /nope/x?y=1 does not exist' });
  });

  it('sets CORS headers for allowed origins with credentials', async () => {
    const res = await request(app).get('/health').set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('does not echo disallowed origins', async () => {
    const res = await request(app).get('/health').set('Origin', 'http://evil.example');
    expect(res.headers['access-control-allow-origin']).not.toBe('http://evil.example');
  });

  it('answers CORS preflight', async () => {
    const res = await request(app).options('/api/resume/save').set('Origin', 'http://localhost:3000').set('Access-Control-Request-Method', 'POST');
    expect(res.status).toBe(204);
  });

  it('returns 400 JSON for malformed request bodies', async () => {
    const res = await request(app).post('/api/resume/save').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
