import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { studentService } from '../../services/studentService';

export default function StudentDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = async () => {
    try {
      setError(null);
      const result = await studentService.getDashboard();
      setData(result.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard. Please try again.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) return <StudentLayout><div className="text-red-600">{error}</div></StudentLayout>;
  if (!data) return <StudentLayout><div>Loading...</div></StudentLayout>;

  return (
    <StudentLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {data.student.firstName}</h1>
          <p className="text-sm text-slate-500">Track progress, flashcards, scores, AI suggestions, and your saved documents</p>
        </div>
        <Button onClick={async () => { 
          try {
            await studentService.refreshRecommendations(); 
            load();
          } catch (err) {
            console.error('Failed to refresh recommendations:', err);
            setError('Failed to refresh recommendations. Please try again.');
          }
        }}>Refresh AI Suggestions</Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <Card><p className="text-sm text-slate-500">Available Courses</p><h3 className="mt-2 text-3xl font-bold">{data.stats.availableCourses}</h3></Card>
        <Card><p className="text-sm text-slate-500">Completed Modules</p><h3 className="mt-2 text-3xl font-bold">{data.stats.completedModules}</h3></Card>
        <Card><p className="text-sm text-slate-500">Quiz Average</p><h3 className="mt-2 text-3xl font-bold">{data.stats.avgQuizScore}%</h3></Card>
        <Card><p className="text-sm text-slate-500">Recommendations</p><h3 className="mt-2 text-3xl font-bold">{data.stats.recommendations}</h3></Card>
        <Card><p className="text-sm text-slate-500">Flashcards</p><h3 className="mt-2 text-3xl font-bold">{data.stats.flashcards}</h3></Card>
        <Card><p className="text-sm text-slate-500">Saved Documents</p><h3 className="mt-2 text-3xl font-bold">{data.stats.documents || 0}</h3></Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Personalized Suggestions</h3>
          <div className="space-y-4">
            {data.recommendations.map((rec) => (
              <div key={rec._id} className="rounded-xl border p-4">
                <div className="font-medium">{rec.title}</div>
                <div className="mt-1 text-sm text-slate-600">{rec.reason}</div>
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                  {rec.suggestedActions?.map((action, idx) => <li key={idx}>{action}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">Top Categories</h3>
          <div className="space-y-3">
            {Object.entries(data.topCategories).map(([name, count]) => (
              <div key={name} className="rounded-xl border p-4">
                <div className="flex justify-between font-medium"><span>{name}</span><span>{count}</span></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
          <div className="space-y-3">
            {data.recentActivity.map((activity) => (
              <div key={activity._id} className="rounded-xl border p-4">
                <div className="font-medium">{activity.activityType}</div>
                <div className="text-sm text-slate-500">{activity.resourceType}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">In Progress Courses</h3>
          <div className="space-y-3">
            {data.progress.map((item) => (
              <div key={item._id} className="rounded-xl border p-4">
                <div className="font-medium">{item.course?.title}</div>
                <div className="mt-2 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-600" style={{ width: `${item.completionPercent}%` }} /></div>
                <div className="mt-2 text-sm text-slate-500">{item.completionPercent}% complete</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">Document Center</h3>
          <p className="text-sm text-slate-600">Upload PDFs, search saved study packs, export learning data, and review attempt history.</p>
          <Link to="/student/documents" className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
            Open Documents Page
          </Link>
        </Card>
      </div>
    </StudentLayout>
  );
}
