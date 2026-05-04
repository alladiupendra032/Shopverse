const { Pinecone } = require('@pinecone-database/pinecone');
const path = require('path');

/* ── Pinecone client (lazy init) ──────────────────────────── */
let _index = null;
const getIndex = () => {
  if (_index) return _index;
  const apiKey    = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;
  if (!apiKey || !indexName) throw new Error('PINECONE_API_KEY and PINECONE_INDEX_NAME must be set in backend/.env');
  const pc = new Pinecone({ apiKey });
  _index = pc.index(indexName);
  return _index;
};

/* ── Helpers ──────────────────────────────────────────────── */
const NAMESPACE = process.env.PINECONE_NAMESPACE || 'shopverse';

/** Chunk text into ~500-char overlapping pieces */
const chunkText = (text, size = 500, overlap = 50) => {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return chunks;
};

/** Embed a single text string via Pinecone's inference API */
const embedText = async (pc, text) => {
  const model = process.env.PINECONE_EMBED_MODEL || 'multilingual-e5-large';
  const result = await pc.inference.embed(model, [text], { inputType: 'passage' });
  return result[0]?.values || result.data?.[0]?.values;
};

/* ══════════════════════════════════════════════════════════
   GET /ingest/files  — list all unique source files indexed
══════════════════════════════════════════════════════════ */
const listFiles = async (req, res) => {
  try {
    const index = getIndex();
    const stats = await index.describeIndexStats();
    const ns    = stats.namespaces?.[NAMESPACE];

    if (!ns || ns.vectorCount === 0) {
      return res.json({ files: [] });
    }

    // We store source filename in metadata; query with dummy vector to get metadata
    // Use a zero vector just to fetch metadata via list
    const dim    = stats.dimension || 1024;
    const dummy  = Array(dim).fill(0);
    const result = await index.namespace(NAMESPACE).query({
      vector:          dummy,
      topK:            10000,
      includeMetadata: true,
    });

    // Aggregate chunks per file
    const fileMap = {};
    for (const match of result.matches || []) {
      const src = match.metadata?.source;
      if (!src) continue;
      const filename = path.basename(src);
      fileMap[filename] = (fileMap[filename] || 0) + 1;
    }

    const files = Object.entries(fileMap).map(([file, chunks]) => ({ file, chunks }));
    res.json({ files });
  } catch (err) {
    console.error('[RAG] listFiles error:', err.message);
    res.status(500).json({ detail: err.message });
  }
};

/* ══════════════════════════════════════════════════════════
   POST /ingest/upload  — upload & index a file
══════════════════════════════════════════════════════════ */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: 'No file uploaded.' });

    const apiKey    = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX_NAME;
    if (!apiKey || !indexName) {
      return res.status(500).json({ detail: 'PINECONE_API_KEY and PINECONE_INDEX_NAME must be set.' });
    }

    const pc       = new Pinecone({ apiKey });
    const index    = pc.index(indexName);
    const filename = req.file.originalname;
    const text     = req.file.buffer.toString('utf-8');

    // Delete existing vectors for this file
    try {
      const stats  = await index.describeIndexStats();
      const dim    = stats.dimension || 1024;
      const dummy  = Array(dim).fill(0);
      const old    = await index.namespace(NAMESPACE).query({
        vector:          dummy,
        topK:            10000,
        includeMetadata: true,
        filter:          { source: { $eq: filename } },
      });
      const oldIds = (old.matches || []).map(m => m.id);
      if (oldIds.length > 0) {
        await index.namespace(NAMESPACE).deleteMany(oldIds);
      }
    } catch (_) { /* ignore if no old vectors */ }

    // Chunk the document
    const chunks = chunkText(text);

    // Embed and upsert all chunks
    const model  = process.env.PINECONE_EMBED_MODEL || 'multilingual-e5-large';
    const model_result = await pc.inference.embed(model, chunks, { inputType: 'passage' });
    const vectors = chunks.map((chunk, i) => ({
      id:       `${filename}__chunk_${i}`,
      values:   model_result[i]?.values || model_result.data?.[i]?.values,
      metadata: { source: filename, chunk_id: i, text: chunk },
    }));

    await index.namespace(NAMESPACE).upsert(vectors);

    res.json({ message: 'File indexed successfully.', chunks_indexed: chunks.length });
  } catch (err) {
    console.error('[RAG] uploadFile error:', err.message);
    res.status(500).json({ detail: err.message });
  }
};

/* ══════════════════════════════════════════════════════════
   DELETE /ingest/files/:filename  — remove file from index
══════════════════════════════════════════════════════════ */
const deleteFile = async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const index    = getIndex();

    const stats  = await index.describeIndexStats();
    const dim    = stats.dimension || 1024;
    const dummy  = Array(dim).fill(0);
    const result = await index.namespace(NAMESPACE).query({
      vector:          dummy,
      topK:            10000,
      includeMetadata: true,
      filter:          { source: { $eq: filename } },
    });

    const ids = (result.matches || []).map(m => m.id);
    if (ids.length > 0) {
      await index.namespace(NAMESPACE).deleteMany(ids);
    }

    res.json({ message: `Removed ${ids.length} chunks for "${filename}".`, chunks_removed: ids.length });
  } catch (err) {
    console.error('[RAG] deleteFile error:', err.message);
    res.status(500).json({ detail: err.message });
  }
};

/* ══════════════════════════════════════════════════════════
   POST /chat  — answer a query using RAG
══════════════════════════════════════════════════════════ */
const chat = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ detail: 'query is required.' });

    const apiKey    = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX_NAME;
    const groqKey   = process.env.GROQ_API_KEY;
    if (!apiKey || !indexName || !groqKey) {
      return res.status(500).json({ detail: 'PINECONE_API_KEY, PINECONE_INDEX_NAME, and GROQ_API_KEY must be set.' });
    }

    const pc    = new Pinecone({ apiKey });
    const index = pc.index(indexName);
    const model = process.env.PINECONE_EMBED_MODEL || 'multilingual-e5-large';

    // Embed the query
    const embResult = await pc.inference.embed(model, [query], { inputType: 'query' });
    const queryVec  = embResult[0]?.values || embResult.data?.[0]?.values;

    // Retrieve top-k context chunks
    const results  = await index.namespace(NAMESPACE).query({
      vector:          queryVec,
      topK:            5,
      includeMetadata: true,
    });

    const sources  = (results.matches || []).map(m => ({
      file:     m.metadata?.source || '',
      chunk_id: m.metadata?.chunk_id ?? 0,
    }));
    const context  = (results.matches || []).map(m => m.metadata?.text || '').join('\n\n---\n\n');

    // Call Groq LLM
    const groqRes  = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body:    JSON.stringify({
        model:    process.env.GROQ_MODEL || 'llama3-8b-8192',
        messages: [
          {
            role:    'system',
            content: `You are ShopVerse's helpful shopping assistant. Answer using only the provided context. If the answer isn't in the context, say you don't have that information.\n\nContext:\n${context}`,
          },
          { role: 'user', content: query },
        ],
        temperature: 0.3,
        max_tokens:  512,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Groq API error ${groqRes.status}`);
    }

    const groqData = await groqRes.json();
    const answer   = groqData.choices?.[0]?.message?.content || 'No answer generated.';
    res.json({ answer, sources });
  } catch (err) {
    console.error('[RAG] chat error:', err.message);
    res.status(500).json({ detail: err.message });
  }
};

module.exports = { listFiles, uploadFile, deleteFile, chat };
