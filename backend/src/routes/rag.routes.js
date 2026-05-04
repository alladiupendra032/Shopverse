const express  = require('express');
const multer   = require('multer');
const { listFiles, uploadFile, deleteFile, chat } = require('../controllers/rag.controller');

const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

/* ── Ingest routes ── */
router.get('/ingest/files',                          listFiles);
router.post('/ingest/upload', upload.single('file'), uploadFile);
router.delete('/ingest/files/:filename',             deleteFile);

/* ── Chat route ── */
router.post('/chat', chat);

module.exports = router;
