import { useEffect, useState } from 'react';
import InstructorLayout from '../../layouts/InstructorLayout';
import Card from '../../components/common/Card';
import { instructorService } from '../../services/instructorService';

export default function InstructorDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    instructorService.getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('Failed to load instructor dashboard:', err);
        setError('Failed to load instructor dashboard.');
      });
  }, []);

  if (error) return <InstructorLayout><div className="text-rose-600">{error}</div></InstructorLayout>;
  if (!data) return <InstructorLayout><div>Loading...</div></InstructorLayout>;

  return (
    <InstructorLayout>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-sm text-slate-500">Total Content</p><h3 className="mt-2 text-3xl font-bold">{data.stats.totalContent}</h3></Card>
        <Card><p className="text-sm text-slate-500">Videos</p><h3 className="mt-2 text-3xl font-bold">{data.stats.totalVideos}</h3></Card>
        <Card><p className="text-sm text-slate-500">Documents</p><h3 className="mt-2 text-3xl font-bold">{data.stats.totalDocuments}</h3></Card>
        <Card><p className="text-sm text-slate-500">Total Views</p><h3 className="mt-2 text-3xl font-bold">{data.stats.totalViews}</h3></Card>
      </div>

      <div className="mt-6">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Recent Uploads</h3>
          <div className="space-y-3">
            {data.recentContent.map((item) => (
              <div key={item._id} className="rounded-xl border p-4">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-slate-500">{item.contentType} • {item.viewCount} views</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </InstructorLayout>
  );
}
