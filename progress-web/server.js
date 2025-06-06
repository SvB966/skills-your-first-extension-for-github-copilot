import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('progress.db');

// Initialize tables
const initQueries = [
  `CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS teachers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, teacher_id INTEGER, year INTEGER, FOREIGN KEY(teacher_id) REFERENCES teachers(id))`,
  `CREATE TABLE IF NOT EXISTS grades (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER, course_id INTEGER, grade TEXT, FOREIGN KEY(student_id) REFERENCES students(id), FOREIGN KEY(course_id) REFERENCES courses(id))`
];
initQueries.forEach(q => db.prepare(q).run());

const app = express();
app.use(express.json());

// Serve basic home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// CRUD for students
app.get('/api/students', (req, res) => {
  const rows = db.prepare('SELECT * FROM students').all();
  res.json(rows);
});
app.post('/api/students', (req, res) => {
  const { name } = req.body;
  const info = db.prepare('INSERT INTO students (name) VALUES (?)').run(name);
  res.json({ id: info.lastInsertRowid, name });
});

// CRUD for teachers
app.get('/api/teachers', (req, res) => {
  const rows = db.prepare('SELECT * FROM teachers').all();
  res.json(rows);
});
app.post('/api/teachers', (req, res) => {
  const { name } = req.body;
  const info = db.prepare('INSERT INTO teachers (name) VALUES (?)').run(name);
  res.json({ id: info.lastInsertRowid, name });
});

// CRUD for courses
app.get('/api/courses', (req, res) => {
  const rows = db.prepare('SELECT courses.id, courses.name, courses.year, teachers.name AS teacher FROM courses LEFT JOIN teachers ON courses.teacher_id = teachers.id').all();
  res.json(rows);
});
app.post('/api/courses', (req, res) => {
  const { name, teacher_id, year } = req.body;
  const info = db.prepare('INSERT INTO courses (name, teacher_id, year) VALUES (?, ?, ?)').run(name, teacher_id, year);
  res.json({ id: info.lastInsertRowid, name, teacher_id, year });
});

// CRUD for grades
app.get('/api/grades', (req, res) => {
  const rows = db.prepare(`SELECT grades.id, students.name AS student, courses.name AS course, courses.year, grades.grade
                           FROM grades
                           LEFT JOIN students ON grades.student_id = students.id
                           LEFT JOIN courses ON grades.course_id = courses.id`).all();
  res.json(rows);
});
app.post('/api/grades', (req, res) => {
  const { student_id, course_id, grade } = req.body;
  const info = db.prepare('INSERT INTO grades (student_id, course_id, grade) VALUES (?, ?, ?)').run(student_id, course_id, grade);
  res.json({ id: info.lastInsertRowid, student_id, course_id, grade });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Progress web app running on http://localhost:${port}`);
});
