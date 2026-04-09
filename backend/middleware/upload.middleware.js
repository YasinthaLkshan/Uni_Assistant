import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (subfolder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.join(UPLOADS_DIR, subfolder);
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

const fileFilter = (_req, file, cb) => {
  const allowed = [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".zip",
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed`), false);
  }
};

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export const uploadMaterial = multer({
  storage: createStorage("materials"),
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).single("file");

export const uploadExamPaper = multer({
  storage: createStorage("exam-papers"),
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).single("file");

export const uploadCoursework = multer({
  storage: createStorage("coursework"),
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).single("file");
