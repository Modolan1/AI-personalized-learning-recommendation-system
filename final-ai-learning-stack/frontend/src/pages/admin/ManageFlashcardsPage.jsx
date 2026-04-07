import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { adminService } from '../../services/adminService';

export default function ManageFlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ course: '', category: '', question: '', answer: '', difficulty: 'Easy' });

  const load = async () => {
    const [flashRes, courseRes, catRes] = await Promise.all([
      adminService.getFlashcards(),
      adminService.getCourses(),
      adminService.getCategories(),
    ]);
    setFlashcards(flashRes.data);
    setCourses(courseRes.data);
    setCategories(catRes.data);
    setForm((prev) => ({ ...prev, course: prev.course || courseRes.data[0]?._id || '', category: prev.category || catRes.data[0]?._id || '' }));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await adminService.createFlashcard(form);
    setForm({ course: courses[0]?._id || '', category: categories[0]?._id || '', question: '', answer: '', difficulty: 'Easy' });
    load();
  };

  return (
    <AdminLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Add Flashcard</h3>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
              <select className="w-full rounded-xl border border-slate-200 p-3" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <select className="w-full rounded-xl border border-slate-200 p-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
            </div>
            <Input label="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            <Input label="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Difficulty</label>
              <select className="w-full rounded-xl border border-slate-200 p-3" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <Button className="w-full">Save Flashcard</Button>
          </form>
        </Card>
        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          {flashcards.map((card) => (
            <Card key={card._id}>
              <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">{card.category?.name}</div>
              <h3 className="mt-2 font-semibold text-slate-900">{card.question}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.answer}</p>
              <div className="mt-3 text-sm text-slate-500">{card.course?.title} • {card.difficulty}</div>
              <Button variant="secondary" className="mt-4" onClick={async () => { await adminService.deleteFlashcard(card._id); load(); }}>Delete</Button>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
