// Importing this file in an integration test registers no mocks itself (vi.mock must live in the test file),
// it just re-exports the shared handles for convenience.
export { ext, resetExternals, llmReply, sampleParsedResume } from '../mocks/externals';
export { getApp } from './testApp';
export { mockQuery, fakeDoc } from './testDb';
