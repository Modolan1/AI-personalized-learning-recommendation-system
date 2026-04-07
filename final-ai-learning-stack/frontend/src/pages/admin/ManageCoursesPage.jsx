import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { adminService } from '../../services/adminService';

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: '', level: 'Beginner', durationHours: 1, thumbnail: '',
    modules: [{ title: '', durationMinutes: 20, type: 'reading' }],
  });

  const load = async () => {
    const [courseRes, categoryRes] = await Promise.all([adminService.getCourses(), adminService.getCategories()]);
    setCourses(courseRes.data);
    setCategories(categoryRes.data);
    if (!form.category && categoryRes.data[0]) setForm((prev) => ({ ...prev, category: categoryRes.data[0]._id }));
  };
  useEffect(() => { load(); }, []);

  const updateModule = (index, field, value) => {
    const next = [...form.modules];
    next[index] = { ...next[index], [field]: field === 'durationMinutes' ? Number(value) : value };
    setForm({ ...form, modules: next });
  };

  const addModule = () => setForm({ ...form, modules: [...form.modules, { title: '', durationMinutes: 20, type: 'reading' }] });

  const submit = async (e) => {
    e.preventDefault();
    await adminService.createCourse({ ...form, durationHours: Number(form.durationHours) });
    setForm({ title: '', description: '', category: categories[0]?._id || '', level: 'Beginner', durationHours: 1, thumbnail: '', modules: [{ title: '', durationMinutes: 20, type: 'reading' }] });
    load();
  };

  return (
    <AdminLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Add Course</h3>
          <form onSubmit={submit} className="space-y-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <select className="w-full rounded-xl border border-slate-200 p-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
            </div>
            <Input label="Thumbnail URL" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Level</label>
                <select className="w-full rounded-xl border border-slate-200 p-3" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <Input label="Duration Hours" type="number" value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })} />
            </div>
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-700">Modules</div>
              {form.modules.map((module, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-3">
                  <Input label={`Module ${idx + 1} Title`} value={module.title} onChange={(e) => updateModule(idx, 'title', e.target.value)} />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Input label="Minutes" type="number" value={module.durationMinutes} onChange={(e) => updateModule(idx, 'durationMinutes', e.target.value)} />
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
                      <select className="w-full rounded-xl border border-slate-200 p-3" value={module.type} onChange={(e) => updateModule(idx, 'type', e.target.value)}>
                        <option value="reading">Reading</option><option value="video">Video</option><option value="exercise">Exercise</option><option value="project">Project</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="secondary" className="w-full" onClick={addModule}>Add Module</Button>
            </div>
            <Button className="w-full">Save Course</Button>
          </form>
        </Card>
        <div className="lg:col-span-2 space-y-4">
          {courses.map((course) => (
            <Card key={course._id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">{course.category?.name}</div>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{course.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                  <div className="mt-3 text-sm text-slate-500">{course.level} • {course.durationHours} hour(s) • {course.modules?.length || 0} modules</div>
                </div>
                <Button variant="secondary" onClick={async () => { await adminService.deleteCourse(course._id); load(); }}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
